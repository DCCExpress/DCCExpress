import {
    CommandCenter,
    LocoState,
    SensorInfo,
    TurnoutInfo,
    AccessoryInfo,
    RBusInfo,
    RBusSensorInfo
} from "./CommandCenter.js";

import { log, logError } from "../utility.js";
import { UdpClient, bufferToHex, type UdpMessage } from "./udpClient.js";

const LAN_X_HEADER = 0x0040;

const LAN_X_SET_TRACK_POWER_OFF = [0x21, 0x80];
const LAN_X_SET_TRACK_POWER_ON = [0x21, 0x81];
const LAN_X_SET_STOP = [0x80];

const LAN_X_GET_TURNOUT_INFO = 0x43;
const LAN_X_SET_TURNOUT = 0x53;
const LAN_X_TURNOUT_INFO = 0x43;

const LAN_X_GET_LOCO_INFO = 0xe3;
const LAN_X_SET_LOCO_DRIVE = 0xe4;
const LAN_X_SET_LOCO_FUNCTION = 0xe4;
const LAN_X_LOCO_INFO = 0xef;

const Z21_SPEED_STEPS_128 = 0x13;
const Z21_LOCO_FUNCTION = 0xf8;

const LAN_SYSTEMSTATE_GETDATA = 0x0085;
const LAN_SYSTEMSTATE_DATACHANGED = 0x0084;

const LAN_SET_BROADCASTFLAGS = 0x0050;

// Z21 broadcast flags
const BC_ALL = 0x00000001;
const BC_RBUS = 0x00000002;
const BC_SYSTEM_STATE = 0x00000100;

const LAN_RMBUS_DATACHANGED = 0x0080;
const LAN_RMBUS_GETDATA = 0x0081;
const LAN_RMBUS_PROGRAMMODULE = 0x0082;

type WsBroadcaster = (message: unknown) => void;

export type Z21SystemState = {
    mainCurrentMa: number;
    progCurrentMa: number;
    filteredMainCurrentMa: number;
    temperatureC: number;
    supplyVoltageMv: number;
    vccVoltageMv: number;
    centralState: number;
    centralStateEx: number;
    reserved: number;
    capabilities: number;

    powerInfo: {
        emergencyStop: boolean;
        trackVoltageOn: boolean;
        trackVoltageOff: boolean;
        shortCircuit: boolean;
        programmingModeActive: boolean;
    };

    flags: {
        highTemperature: boolean;
        powerLost: boolean;
        shortCircuitExternal: boolean;
        shortCircuitInternal: boolean;
        rcn213: boolean;

        capDcc: boolean;
        capMm: boolean;
        capRailCom: boolean;
        capLocoCmds: boolean;
        capAccessoryCmds: boolean;
        capDetectorCmds: boolean;
        capNeedsUnlockCode: boolean;
    };
};

export class Z21CommandCenter extends CommandCenter {
    ip: string = "";
    port: number = 21105;

    udpClient: UdpClient;

    lastSentTime: number = 0;

    taskId: NodeJS.Timeout | undefined = undefined;
    polingTask: NodeJS.Timeout | undefined = undefined;

    buffer: unknown[] = [];

    private started = false;
    private lastSystemState: Z21SystemState | undefined = undefined;
    private readonly wsBroadcast: WsBroadcaster;

    constructor(
        name: string,
        ip: string,
        port: number,
        wsBroadcast: WsBroadcaster
    ) {
        super(name);

        this.ip = ip;
        this.port = port;
        this.wsBroadcast = wsBroadcast;

        this.udpClient = new UdpClient({
            host: this.ip,
            port: this.port,
            timeoutMs: 1500,
            debug: true,
        });

        this.udpClient.on("message", (message: UdpMessage) => {
            this.onUdpMessage(
                message.data,
                message.remote.address,
                message.remote.port
            );
        });

        this.udpClient.on("error", (error: Error) => {
            logError("Z21 UDP error:", error);
            this.started = false;
            this.broadcastCommandCenterInfo(false);
        });

        this.udpClient.on("close", () => {
            log("Z21 UDP closed");
            this.started = false;
            this.broadcastCommandCenterInfo(false);
        });
    }

    getConnectionString(): string {
        return `z21://${this.ip}:${this.port}`;
    }

    async start(): Promise<boolean> {
        try {
            log("Starting Z21 command center with config:", {
                name: this.name,
                ip: this.ip,
                port: this.port,
            });

            await this.udpClient.open();

            this.started = true;
            this.broadcastCommandCenterInfo(true);

            await this.setBroadcastFlags(BC_ALL | BC_RBUS | BC_SYSTEM_STATE);

            await this.getSystemState();

            await this.getRBusGroup(0);
            await this.getRBusGroup(1);

            this.startPollingSystemState();

            log("Z21 command center started");

            return true;
        } catch (error) {
            logError("Z21 start failed:", error);

            this.started = false;
            this.broadcastCommandCenterInfo(false);

            return false;
        }
    }

    async stop(): Promise<boolean> {
        try {
            log("Stopping Z21 command center with config:", {
                name: this.name,
                ip: this.ip,
                port: this.port,
            });

            this.stopPollingSystemState();

            this.udpClient.close();

            this.started = false;
            this.broadcastCommandCenterInfo(false);

            return true;
        } catch (error) {
            logError("Z21 stop failed:", error);
            return false;
        }
    }

    clientConnected22(): void {
        this.broadcastCommandCenterInfo(this.started);

        if (this.lastSystemState) {
            this.broadcastWs("z21SystemState", this.lastSystemState);
            this.broadcastWs("powerInfo", this.lastSystemState.powerInfo);
        } else {
            void this.getSystemState();
        }
    }

    clientConnected(): void {
        this.broadcastCommandCenterInfo(this.started);

        if (this.lastSystemState) {
            this.broadcastWs("z21SystemState", this.lastSystemState);
            this.broadcastWs("powerInfo", this.lastSystemState.powerInfo);
        } else {
            void this.getSystemState();
        }

        for (const turnout of this.turnouts.values()) {
            this.broadcastWs("turnoutChanged", {
                address: turnout.address,
                closed: turnout.closed,
            });
        }

        for (const accessory of this.accessories.values()) {
            this.broadcastAccessoryChanged(accessory);
        }

        for (const loco of this.getLocos()) {
            this.broadcastWs("locoState", {
                loco,
            });
        }

        for (const sensor of this.sensors.values()) {
            this.broadcastWs("sensorChanged", {
                address: sensor.address,
                active: sensor.active,
            });
        }

        for (const [group, bytes] of this.rbusGroups.entries()) {
            this.broadcastWs("rbusInfo", {
                group,
                bytes,
            });
        }
    }
    //   async setTurnout(address: number, closed: boolean): Promise<boolean> {
    //     log("Z21 setTurnout not implemented yet:", { address, closed });
    //     return Promise.resolve(false);
    //   }

    //   async getTurnout(address: number): Promise<TurnoutInfo | null> {
    //     log("Z21 getTurnout not implemented yet:", { address });
    //     return Promise.resolve(null);
    //   }


    async setTurnout(address: number, closed: boolean): Promise<boolean> {
        try {
            const functionAddress = this.toZ21FunctionAddress(address);

            const msb = (functionAddress >> 8) & 0xff;
            const lsb = functionAddress & 0xff;

            const p = closed ? 1 : 0;

            // Q=0, A=1, P=p
            // 1000A00P => activate: 10001000 | P = 0x88 | p
            const activateDb2 = 0x88 | p;

            // Q=0, A=0, P=p
            // deactivate: 10000000 | P = 0x80 | p
            const deactivateDb2 = 0x80 | p;

            const activatePacket = this.buildLanXPacket([
                LAN_X_SET_TURNOUT,
                msb,
                lsb,
                activateDb2,
            ]);

            const deactivatePacket = this.buildLanXPacket([
                LAN_X_SET_TURNOUT,
                msb,
                lsb,
                deactivateDb2,
            ]);

            log("Z21 setTurnout activate:", {
                address,
                functionAddress,
                closed,
                packet: bufferToHex(activatePacket),
            });

            await this.udpClient.send(activatePacket);

            await sleep(150);

            log("Z21 setTurnout deactivate:", {
                address,
                functionAddress,
                closed,
                packet: bufferToHex(deactivatePacket),
            });

            await this.udpClient.send(deactivatePacket);

            const turnoutInfo: TurnoutInfo = {
                address,
                closed,
            };

            this.turnouts.set(address, turnoutInfo);

            this.broadcastWs("turnoutChanged", {
                address,
                closed,
            });

            this.broadcastWs("z21TurnoutInfo", {
                address,
                closed,
                state: closed ? "pos: P1" : "pos: P0",
                valid: true,
                source: "setTurnout",
            });

            // Utána kérdezzünk is vissza, hogy a Z21 mit mond róla.
            void this.getTurnout(address);

            return true;
        } catch (error) {
            logError("Z21 setTurnout failed:", { address, closed, error });
            return false;
        }
    }

    async getTurnout(address: number): Promise<TurnoutInfo | null> {
        try {
            const functionAddress = this.toZ21FunctionAddress(address);

            const msb = (functionAddress >> 8) & 0xff;
            const lsb = functionAddress & 0xff;

            const packet = this.buildLanXPacket([
                LAN_X_GET_TURNOUT_INFO,
                msb,
                lsb,
            ]);

            log("Z21 getTurnout:", {
                address,
                functionAddress,
                packet: bufferToHex(packet),
            });

            const response = await this.udpClient.sendAndReceive(
                packet,
                (message) => this.containsTurnoutInfoForAddress(message.data, address),
                2000
            );

            const packets = this.splitZ21Packets(response.data);

            const turnoutPacket = packets.find((item) =>
                this.isTurnoutInfoForAddress(item, address)
            );

            if (!turnoutPacket) {
                throw new Error(
                    `Z21 turnout info not found in response: ${bufferToHex(response.data)}`
                );
            }

            const info = this.parseTurnoutInfo(turnoutPacket);

            if (!info) {
                return null;
            }

            this.turnouts.set(info.address, {
                address: info.address,
                closed: info.closed,
            });

            this.broadcastWs("turnoutChanged", {
                address: info.address,
                closed: info.closed,
            });

            this.broadcastWs("z21TurnoutInfo", info);

            return {
                address: info.address,
                closed: info.closed,
            };
        } catch (error) {
            logError("Z21 getTurnout failed:", { address, error });

            return this.turnouts.get(address) ?? null;
        }
    }

    getTurnouts(): TurnoutInfo[] {
        return [...this.turnouts.values()];
    }

    async setLoco(
        address: number,
        speed: number,
        direction: "forward" | "reverse"
    ): Promise<boolean> {
        try {
            const { msb, lsb } = this.encodeLocoAddress(address);

            const normalizedSpeed = clampInt(speed, 0, 126);

            // DCC128:
            // 0 = stop
            // 1 = emergency stop
            // 2 = speed step 1
            // ...
            // 127 = speed step 126
            const z21Speed =
                normalizedSpeed === 0 ? 0 : normalizedSpeed + 1;

            const directionBit = direction === "forward" ? 0x80 : 0x00;
            const speedByte = directionBit | z21Speed;

            const packet = this.buildLanXPacket([
                LAN_X_SET_LOCO_DRIVE,
                Z21_SPEED_STEPS_128,
                msb,
                lsb,
                speedByte,
            ]);

            log("Z21 setLoco:", {
                address,
                speed,
                normalizedSpeed,
                direction,
                packet: bufferToHex(packet),
            });

            await this.udpClient.send(packet);

            const loco = this.getOrCreateLoco(address);
            loco.speed = normalizedSpeed;
            loco.direction = direction;

            this.broadcastLocoState(loco);

            // Subscribe + visszakérdezés, hogy a Z21 által ismert valós állapot is jöjjön.
            setTimeout(() => {
                void this.getLoco(address);
            }, 150);

            return true;
        } catch (error) {
            logError("Z21 setLoco failed:", {
                address,
                speed,
                direction,
                error,
            });

            return false;
        }
    }
    async getLoco(address: number): Promise<LocoState | null> {
        try {
            const { msb, lsb } = this.encodeLocoAddress(address);

            const packet = this.buildLanXPacket([
                LAN_X_GET_LOCO_INFO,
                0xf0,
                msb,
                lsb,
            ]);

            log("Z21 getLoco:", {
                address,
                packet: bufferToHex(packet),
            });

            const response = await this.udpClient.sendAndReceive(
                packet,
                (message) => this.containsLocoInfoForAddress(message.data, address),
                2000
            );

            const packets = this.splitZ21Packets(response.data);

            const locoPacket = packets.find((item) =>
                this.isLocoInfoForAddress(item, address)
            );

            if (!locoPacket) {
                throw new Error(
                    `Z21 loco info not found in response: ${bufferToHex(response.data)}`
                );
            }

            const loco = this.parseLocoInfo(locoPacket);

            if (!loco) {
                return null;
            }

            this.broadcastLocoState(loco);

            return loco;
        } catch (error) {
            logError("Z21 getLoco failed:", {
                address,
                error,
            });

            return this.getOrCreateLoco(address) ?? null;
        }
    }

    async setLocoFunction(
        address: number,
        fn: number,
        active: boolean
    ): Promise<boolean> {
        try {
            if (!Number.isInteger(fn) || fn < 0 || fn > 28) {
                throw new Error(`Invalid loco function index: ${fn}`);
            }

            const { msb, lsb } = this.encodeLocoAddress(address);

            // TTNNNNNN
            // TT = 00 off
            // TT = 01 on
            // NNNNNN = function index
            const functionByte = (active ? 0x40 : 0x00) | (fn & 0x3f);

            const packet = this.buildLanXPacket([
                LAN_X_SET_LOCO_FUNCTION,
                Z21_LOCO_FUNCTION,
                msb,
                lsb,
                functionByte,
            ]);

            log("Z21 setLocoFunction:", {
                address,
                fn,
                active,
                functionByte,
                packet: bufferToHex(packet),
            });

            await this.udpClient.send(packet);

            const loco = this.getOrCreateLoco(address);
            loco.functions[fn] = active;

            this.broadcastLocoState(loco);

            setTimeout(() => {
                void this.getLoco(address);
            }, 150);

            return true;
        } catch (error) {
            logError("Z21 setLocoFunction failed:", {
                address,
                fn,
                active,
                error,
            });

            return false;
        }
    }
    async setTrackPower3(on: boolean): Promise<boolean> {
        try {
            const packet = on
                ? this.buildLanXPacket([0x21, 0x81])
                : this.buildLanXPacket([0x21, 0x80]);

            await this.udpClient.send(packet);

            return true;
        } catch (error) {
            logError("Z21 setTrackPower failed:", error);
            return false;
        }
    }

    async setBasicAccessory(address: number, active: boolean): Promise<boolean> {
        try {
            const functionAddress = this.toZ21FunctionAddress(address);

            const msb = (functionAddress >> 8) & 0xff;
            const lsb = functionAddress & 0xff;

            /**
             * Z21 LAN_X_SET_TURNOUT DB2:
             *
             * Bit 7: mindig 1
             * Bit 3: A = activate/deactivate
             * Bit 0: P = output port
             *
             * Basic accessory esetén egyszerűen az address által kijelölt kimenetet
             * aktív/inaktív állapotba tesszük.
             *
             * Itt P=0-t használunk.
             */
            const p = 0;

            const db2 = active
                ? 0x88 | p // activate
                : 0x80 | p; // deactivate

            const packet = this.buildLanXPacket([
                LAN_X_SET_TURNOUT,
                msb,
                lsb,
                db2,
            ]);

            log("Z21 setBasicAccessory:", {
                address,
                functionAddress,
                active,
                packet: bufferToHex(packet),
            });

            await this.udpClient.send(packet);

            const accessory: AccessoryInfo = {
                address,
                active,
            };

            this.accessories.set(address, accessory);

            this.broadcastAccessoryChanged(accessory);

            return true;
        } catch (error) {
            logError("Z21 setBasicAccessory failed:", {
                address,
                active,
                error,
            });

            return false;
        }
    }
    getAccessory(address: number): Promise<AccessoryInfo | null> {
        return Promise.resolve(this.accessories.get(address) ?? null);
    }

    getAccessories(): AccessoryInfo[] {
        return [...this.accessories.values()];
    }
    async emergencyStop3(): Promise<boolean> {
        try {
            const packet = this.buildLanXPacket([0x80]);

            await this.udpClient.send(packet);

            return true;
        } catch (error) {
            logError("Z21 emergencyStop failed:", error);
            return false;
        }
    }



    async setTrackPower(on: boolean): Promise<boolean> {
        try {
            const packet = this.buildLanXPacket(
                on ? LAN_X_SET_TRACK_POWER_ON : LAN_X_SET_TRACK_POWER_OFF
            );

            log("Z21 setTrackPower:", {
                on,
                packet: bufferToHex(packet),
            });

            await this.udpClient.send(packet);

            this.broadcastWs("powerInfo", {
                emergencyStop: false,
                trackVoltageOn: on,
                trackVoltageOff: !on,
                shortCircuit: false,
                programmingModeActive: false,
            });

            // Z21-től visszakérjük a valódi állapotot is
            setTimeout(() => {
                void this.getSystemState();
            }, 200);

            return true;
        } catch (error) {
            logError("Z21 setTrackPower failed:", {
                on,
                error,
            });

            return false;
        }
    }
    async emergencyStop(): Promise<boolean> {
        try {
            const packet = this.buildLanXPacket(LAN_X_SET_STOP);

            log("Z21 emergencyStop:", {
                packet: bufferToHex(packet),
            });

            await this.udpClient.send(packet);

            this.broadcastWs("powerInfo", {
                emergencyStop: true,
                trackVoltageOn: true,
                trackVoltageOff: false,
                shortCircuit: false,
                programmingModeActive: false,
            });

            setTimeout(() => {
                void this.getSystemState();
            }, 200);

            return true;
        } catch (error) {
            logError("Z21 emergencyStop failed:", error);
            return false;
        }
    }

    // async getSensor(address: number): Promise<SensorInfo | null> {
    //     log("Z21 getSensor not implemented yet:", { address });
    //     return Promise.resolve(null);
    // }

    async getSensor(address: number): Promise<SensorInfo | null> {
        return Promise.resolve(this.sensors.get(address) ?? null);
    }

    async getSystemState(): Promise<Z21SystemState | null> {
        try {
            const response = await this.udpClient.sendAndReceive(
                this.buildZ21Packet(LAN_SYSTEMSTATE_GETDATA),
                (message) => this.containsZ21Header(
                    message.data,
                    LAN_SYSTEMSTATE_DATACHANGED
                ),
                2000
            );

            const packets = this.splitZ21Packets(response.data);
            const systemStatePacket = packets.find((packet) =>
                this.isZ21Header(packet, LAN_SYSTEMSTATE_DATACHANGED)
            );

            if (!systemStatePacket) {
                throw new Error(
                    `Z21 system state response not found: ${bufferToHex(response.data)}`
                );
            }

            const state = this.parseSystemState(systemStatePacket);

            this.lastSystemState = state;

            this.broadcastWs("z21SystemState", state);
            this.broadcastWs("powerInfo", state.powerInfo);

            log("Z21 system state:", state);

            return state;
        } catch (error) {
            logError("Z21 getSystemState failed:", error);
            this.broadcastCommandCenterInfo(false);
            return null;
        }
    }

    async getRBusGroup(group: number): Promise<RBusInfo | null> {
        try {
            if (!Number.isInteger(group) || group < 0 || group > 1) {
                throw new Error(`Invalid RBUS group index: ${group}`);
            }

            const packet = this.buildZ21Packet(
                LAN_RMBUS_GETDATA,
                Buffer.from([group])
            );

            log("Z21 getRBusGroup:", {
                group,
                packet: bufferToHex(packet),
            });

            const response = await this.udpClient.sendAndReceive(
                packet,
                (message) => this.containsRBusDataChangedForGroup(message.data, group),
                2000
            );

            const packets = this.splitZ21Packets(response.data);

            const rbusPacket = packets.find((item) =>
                this.isRBusDataChangedForGroup(item, group)
            );

            if (!rbusPacket) {
                throw new Error(
                    `Z21 RBUS group response not found: ${bufferToHex(response.data)}`
                );
            }

            return this.parseRBusDataChanged(rbusPacket);
        } catch (error) {
            logError("Z21 getRBusGroup failed:", {
                group,
                error,
            });

            const cachedBytes = this.rbusGroups.get(group);
            if (!cachedBytes) return null;

            return {
                group,
                bytes: cachedBytes,
            };
        }
    }

    private decodeAllRBusSensors(group: number, bytes: number[]): RBusSensorInfo[] {
        const sensors: RBusSensorInfo[] = [];

        for (let byteIndex = 0; byteIndex < 10; byteIndex++) {
            const currentByte = bytes[byteIndex] ?? 0;

            for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
                const mask = 1 << bitIndex;
                const on = (currentByte & mask) !== 0;

                const moduleAddress = group * 10 + byteIndex + 1;
                const input = bitIndex + 1;
                const address = (moduleAddress - 1) * 8 + input;

                sensors.push({
                    address,
                    moduleAddress,
                    input,
                    on,
                    group,
                    byteIndex,
                    bitIndex,
                });
            }
        }

        return sensors;
    }
    parse(data: Buffer): void {
        if (data.length < 4) return;

        const len = data.readUInt16LE(0);
        const header = data.readUInt16LE(2);

        if (len > data.length) {
            logError("Z21 parse: invalid packet length", {
                len,
                bufferLength: data.length,
                raw: bufferToHex(data),
            });
            return;
        }

        if (header === LAN_X_HEADER) {
            this.parseLanX(data);
            return;
        }

        if (header === LAN_SYSTEMSTATE_DATACHANGED) {
            const state = this.parseSystemState(data);

            this.lastSystemState = state;

            this.broadcastWs("z21SystemState", state);
            this.broadcastWs("powerInfo", state.powerInfo);

            return;
        }

        if (header === 0x0010 && len === 0x08) {
            const serialNumber = data.readUInt32LE(4);
            log("Z21 serial number:", serialNumber);
            this.broadcastWs("z21SerialNumber", { serialNumber });
            return;
        }

        if (header === LAN_RMBUS_DATACHANGED) {
            this.parseRBusDataChanged(data);
            return;
        }

        log("Z21 unhandled packet:", bufferToHex(data));
    }

    private onUdpMessage(
        buffer: Buffer,
        remoteAddress: string,
        remotePort: number
    ): void {
        try {
            const packets = this.splitZ21Packets(buffer);

            for (const packet of packets) {
                this.parse(packet);
            }
        } catch (error) {
            logError("Z21 UDP message parse failed:", {
                error,
                remoteAddress,
                remotePort,
                raw: bufferToHex(buffer),
            });
        }
    }

    private splitZ21Packets(buffer: Buffer): Buffer[] {
        const packets: Buffer[] = [];
        let offset = 0;

        while (offset + 4 <= buffer.length) {
            const len = buffer.readUInt16LE(offset);

            if (len <= 0) {
                throw new Error(
                    `Invalid Z21 packet length: len=${len}, offset=${offset}`
                );
            }

            if (offset + len > buffer.length) {
                throw new Error(
                    `Z21 packet size mismatch: len=${len}, offset=${offset}, bufferLength=${buffer.length}`
                );
            }

            packets.push(buffer.subarray(offset, offset + len));
            offset += len;
        }

        if (offset !== buffer.length) {
            throw new Error(
                `Z21 trailing bytes: offset=${offset}, bufferLength=${buffer.length}`
            );
        }

        return packets;
    }

    private parseLanX(data: Buffer): void {
        const len = data.readUInt16LE(0);

        if (data.length < 5) return;

        const xHeader = data.readUInt8(4);

        if (len === 0x1109 && xHeader === LAN_X_TURNOUT_INFO) {
            const info = this.parseTurnoutInfo(data);

            if (!info) {
                return;
            }

            this.turnouts.set(info.address, {
                address: info.address,
                closed: info.closed,
            });

            this.broadcastWs("turnoutChanged", {
                address: info.address,
                closed: info.closed,
            });

            this.broadcastWs("z21TurnoutInfo", info);

            log("Z21 turnout info:", info);

            return;
        }
        if (len === 0x09 && xHeader === LAN_X_TURNOUT_INFO) {
            const info = this.parseTurnoutInfo(data);

            if (!info) {
                return;
            }

            this.turnouts.set(info.address, {
                address: info.address,
                closed: info.closed,
            });

            this.broadcastWs("turnoutChanged", {
                address: info.address,
                closed: info.closed,
            });

            this.broadcastWs("z21TurnoutInfo", info);

            /**
             * Ugyanezt basic accessory-ként is értelmezhetjük.
             * Itt az active állapotot a closed értékből vezetjük le.
             *
             * Ez főleg akkor hasznos, ha ugyanazt a Z21 accessory visszajelzést
             * nem váltóként, hanem általános kimenetként használod.
             */
            const accessory: AccessoryInfo = {
                address: info.address,
                active: info.closed,
            };

            this.accessories.set(accessory.address, accessory);
            this.broadcastAccessoryChanged(accessory);

            log("Z21 turnout/accessory info:", {
                turnout: info,
                accessory,
            });

            return;
        }

        // if (xHeader === 0xef && data.length >= 14) {
        //     const address = data.readInt16BE(5) & 0x3fff;

        //     const db3 = data.readUInt8(8);
        //     const direction = (db3 & 0b1000_0000) > 0 ? "forward" : "reverse";
        //     const speed = db3 & 0b0111_1111;

        //     const locoInfo = {
        //         address,
        //         speed,
        //         direction,
        //     };

        //     this.broadcastWs("locoChanged", locoInfo);
        //     this.broadcastWs("z21LocoInfo", locoInfo);

        //     log("Z21 loco info:", locoInfo);

        //     return;
        // }
        if (xHeader === LAN_X_LOCO_INFO) {
            const loco = this.parseLocoInfo(data);

            if (!loco) {
                return;
            }

            this.broadcastLocoState(loco);

            log("Z21 loco info:", loco);

            return;
        }

        if ((len === 0x07 || len === 0x08) && xHeader === 0x61) {
            const info = data.readUInt8(5);

            const powerInfo = {
                emergencyStop: (info & 0x01) === 0x01,
                trackVoltageOff: (info & 0x02) === 0x02,
                trackVoltageOn: (info & 0x02) === 0x00,
                shortCircuit: (info & 0x04) === 0x04,
                programmingModeActive: (info & 0x20) === 0x20,
            };

            this.broadcastWs("powerInfo", powerInfo);

            log("Z21 LAN_X_STATUS_CHANGED:", powerInfo);

            return;
        }

        if (len === 0x07 && xHeader === 0x81) {
            const powerInfo = {
                emergencyStop: true,
                trackVoltageOn: true,
                trackVoltageOff: false,
                shortCircuit: false,
                programmingModeActive: false,
            };

            this.broadcastWs("powerInfo", powerInfo);

            log("Z21 LAN_X_BC_STOPPED:", powerInfo);

            return;
        }

        log("Z21 unhandled LAN_X packet:", bufferToHex(data));
    }

    private parseRBusDataChanged(data: Buffer): RBusInfo | null {
        if (!this.isRBusDataChangedPacket(data)) {
            logError("Z21 invalid RBUS packet:", bufferToHex(data));
            return null;
        }

        const group = data.readUInt8(4);
        const bytes = Array.from(data.subarray(5, 15));

        const previousBytes = this.rbusGroups.get(group) ?? [];
        this.rbusGroups.set(group, bytes);

        const rbus: RBusInfo = {
            group,
            bytes,
        };

        this.broadcastWs("rbusInfo", rbus);

        const changedSensors = this.decodeRBusSensors(group, bytes, previousBytes);

        for (const sensor of changedSensors) {
            this.sensors.set(sensor.address, {
                address: sensor.address,
                active: sensor.on,
            });

            this.broadcastSensorChanged(sensor);
        }

        log("Z21 LAN_RMBUS_DATACHANGED:", {
            group,
            bytes,
            changedSensors,
        });

        return rbus;
    }

    private parseSystemState(data: Buffer): Z21SystemState {
        if (!this.isZ21Header(data, LAN_SYSTEMSTATE_DATACHANGED)) {
            throw new Error(`Invalid Z21 system state packet: ${bufferToHex(data)}`);
        }

        const len = data.readUInt16LE(0);

        if (len < 0x14 || data.length < 0x14) {
            throw new Error(
                `Invalid Z21 system state length: len=${len}, bufferLength=${data.length}`
            );
        }

        const mainCurrentMa = data.readInt16LE(4);
        const progCurrentMa = data.readInt16LE(6);
        const filteredMainCurrentMa = data.readInt16LE(8);
        const temperatureC = data.readInt16LE(10);
        const supplyVoltageMv = data.readUInt16LE(12);
        const vccVoltageMv = data.readUInt16LE(14);
        const centralState = data.readUInt8(16);
        const centralStateEx = data.readUInt8(17);
        const reserved = data.readUInt8(18);
        const capabilities = data.readUInt8(19);

        const powerInfo = {
            emergencyStop: hasFlag(centralState, 0x01),
            trackVoltageOff: hasFlag(centralState, 0x02),
            trackVoltageOn: !hasFlag(centralState, 0x02),
            shortCircuit: hasFlag(centralState, 0x04),
            programmingModeActive: hasFlag(centralState, 0x20),
        };

        return {
            mainCurrentMa,
            progCurrentMa,
            filteredMainCurrentMa,
            temperatureC,
            supplyVoltageMv,
            vccVoltageMv,
            centralState,
            centralStateEx,
            reserved,
            capabilities,

            powerInfo,

            flags: {
                highTemperature: hasFlag(centralStateEx, 0x01),
                powerLost: hasFlag(centralStateEx, 0x02),
                shortCircuitExternal: hasFlag(centralStateEx, 0x04),
                shortCircuitInternal: hasFlag(centralStateEx, 0x08),
                rcn213: hasFlag(centralStateEx, 0x20),

                capDcc: hasFlag(capabilities, 0x01),
                capMm: hasFlag(capabilities, 0x02),
                capRailCom: hasFlag(capabilities, 0x08),
                capLocoCmds: hasFlag(capabilities, 0x10),
                capAccessoryCmds: hasFlag(capabilities, 0x20),
                capDetectorCmds: hasFlag(capabilities, 0x40),
                capNeedsUnlockCode: hasFlag(capabilities, 0x80),
            },
        };
    }

    private async setBroadcastFlags(flags: number): Promise<void> {
        const payload = Buffer.alloc(4);
        payload.writeUInt32LE(flags, 0);

        const packet = this.buildZ21Packet(LAN_SET_BROADCASTFLAGS, payload);

        await this.udpClient.send(packet);

        log("Z21 broadcast flags sent:", {
            flags,
            hex: `0x${flags.toString(16).padStart(8, "0")}`,
        });
    }

    private startPollingSystemState(): void {
        this.stopPollingSystemState();

        this.polingTask = setInterval(() => {
            void this.getSystemState();
        }, 50000);
    }

    private stopPollingSystemState(): void {
        if (this.polingTask) {
            clearInterval(this.polingTask);
            this.polingTask = undefined;
        }
    }

    private buildZ21Packet(header: number, payload?: Buffer): Buffer {
        const data = payload ?? Buffer.alloc(0);
        const len = 4 + data.length;

        const packet = Buffer.alloc(len);

        packet.writeUInt16LE(len, 0);
        packet.writeUInt16LE(header, 2);

        data.copy(packet, 4);

        return packet;
    }

    private buildLanXPacket(bytesWithoutXor: number[]): Buffer {
        const xor = bytesWithoutXor.reduce((acc, value) => acc ^ value, 0);
        const payload = Buffer.from([...bytesWithoutXor, xor]);

        return this.buildZ21Packet(LAN_X_HEADER, payload);
    }

    private isZ21Header(buffer: Buffer, header: number): boolean {
        if (buffer.length < 4) return false;

        const len = buffer.readUInt16LE(0);
        const packetHeader = buffer.readUInt16LE(2);

        return len <= buffer.length && packetHeader === header;
    }

    private containsZ21Header(buffer: Buffer, header: number): boolean {
        try {
            const packets = this.splitZ21Packets(buffer);
            return packets.some((packet) => this.isZ21Header(packet, header));
        } catch {
            return false;
        }
    }

    private broadcastCommandCenterInfo(alive: boolean): void {
        this.broadcastWs("commandCenterInfo", {
            name: this.name,
            type: "z21",
            ip: this.ip,
            port: this.port,
            alive,
        });
    }

    private broadcastWs(type: string, data: unknown): void {
        this.wsBroadcast({
            type,
            data,
        });
    }

    private parseTurnoutInfo(data: Buffer):
        | {
            address: number;
            closed: boolean;
            valid: boolean;
            state: string;
            rawState: number;
            functionAddress: number;
        }
        | null {
        if (!this.isTurnoutInfoPacket(data)) {
            logError("Z21 invalid turnout info packet:", bufferToHex(data));
            return null;
        }

        const xHeader = data.readUInt8(4);
        const msb = data.readUInt8(5);
        const lsb = data.readUInt8(6);
        const zzRaw = data.readUInt8(7);
        const xor = data.readUInt8(8);

        const valid = (xHeader ^ msb ^ lsb ^ zzRaw) === xor;

        const functionAddress = (msb << 8) + lsb;
        const address = functionAddress + 1;

        const zz = zzRaw & 0x03;

        let closed = false;
        let state = "NA";

        switch (zz) {
            case 0:
                state = "Turnout not switched yet";
                break;

            case 1:
                state = "pos: P0";
                closed = false;
                break;

            case 2:
                state = "pos: P1";
                closed = true;
                break;

            case 3:
                state = "Invalid";
                break;
        }

        return {
            address,
            closed,
            valid,
            state,
            rawState: zz,
            functionAddress,
        };
    }

    private isTurnoutInfoPacket(data: Buffer): boolean {
        if (data.length < 9) return false;

        const len = data.readUInt16LE(0);
        const header = data.readUInt16LE(2);
        const xHeader = data.readUInt8(4);

        return (
            len === 0x09 &&
            header === LAN_X_HEADER &&
            xHeader === LAN_X_TURNOUT_INFO
        );
    }

    private isTurnoutInfoForAddress(data: Buffer, address: number): boolean {
        if (!this.isTurnoutInfoPacket(data)) return false;

        const functionAddress = this.toZ21FunctionAddress(address);

        const msb = data.readUInt8(5);
        const lsb = data.readUInt8(6);

        const packetFunctionAddress = (msb << 8) + lsb;

        return packetFunctionAddress === functionAddress;
    }

    private containsTurnoutInfoForAddress(buffer: Buffer, address: number): boolean {
        try {
            const packets = this.splitZ21Packets(buffer);

            return packets.some((packet) =>
                this.isTurnoutInfoForAddress(packet, address)
            );
        } catch {
            return false;
        }
    }

    private toZ21FunctionAddress(address: number): number {
        if (!Number.isInteger(address) || address < 1) {
            throw new Error(`Invalid turnout address: ${address}`);
        }

        // A Z21 function address 0-alapú,
        // a mi UI / DCCExpress címünk 1-alapú.
        return address - 1;
    }


    private encodeLocoAddress(address: number): { msb: number; lsb: number } {
        if (!Number.isInteger(address) || address < 1 || address > 9999) {
            throw new Error(`Invalid loco address: ${address}`);
        }

        let msb = (address >> 8) & 0x3f;
        const lsb = address & 0xff;

        // Z21: hosszú címeknél a felső két bitet állítani kell.
        if (address >= 128) {
            msb |= 0xc0;
        }

        return { msb, lsb };
    }

    private decodeLocoAddress(msb: number, lsb: number): number {
        return ((msb & 0x3f) << 8) | lsb;
    }

    private isLocoInfoPacket(data: Buffer): boolean {
        if (data.length < 11) return false;

        const len = data.readUInt16LE(0);
        const header = data.readUInt16LE(2);
        const xHeader = data.readUInt8(4);

        return (
            len >= 0x0b &&
            header === LAN_X_HEADER &&
            xHeader === LAN_X_LOCO_INFO
        );
    }

    private isLocoInfoForAddress(data: Buffer, address: number): boolean {
        if (!this.isLocoInfoPacket(data)) return false;

        const msb = data.readUInt8(5);
        const lsb = data.readUInt8(6);

        const packetAddress = this.decodeLocoAddress(msb, lsb);

        return packetAddress === address;
    }

    private containsLocoInfoForAddress(buffer: Buffer, address: number): boolean {
        try {
            const packets = this.splitZ21Packets(buffer);

            return packets.some((packet) =>
                this.isLocoInfoForAddress(packet, address)
            );
        } catch {
            return false;
        }
    }

    private parseLocoInfo(data: Buffer): LocoState | null {
        if (!this.isLocoInfoPacket(data)) {
            logError("Z21 invalid loco info packet:", bufferToHex(data));
            return null;
        }

        const len = data.readUInt16LE(0);

        const adrMsb = data.readUInt8(5);
        const adrLsb = data.readUInt8(6);
        const db2 = data.readUInt8(7);
        const db3 = data.readUInt8(8);

        const address = this.decodeLocoAddress(adrMsb, adrLsb);

        const rawSpeed = db3 & 0x7f;
        const direction: "forward" | "reverse" =
            (db3 & 0x80) !== 0 ? "forward" : "reverse";

        const speed =
            rawSpeed === 0
                ? 0
                : rawSpeed === 1
                    ? 0
                    : rawSpeed - 1;

        const loco = this.getOrCreateLoco(address);

        loco.address = address;
        loco.speed = speed;
        loco.direction = direction;

        // DB4: 0DSLFGHJ
        // L = F0
        // F = F4
        // G = F3
        // H = F2
        // J = F1
        if (data.length > 9) {
            const db4 = data.readUInt8(9);

            loco.functions[0] = (db4 & 0x10) !== 0;
            loco.functions[1] = (db4 & 0x01) !== 0;
            loco.functions[2] = (db4 & 0x02) !== 0;
            loco.functions[3] = (db4 & 0x04) !== 0;
            loco.functions[4] = (db4 & 0x08) !== 0;
        }

        // DB5: F5-F12, F5 bit0
        if (data.length > 10) {
            const db5 = data.readUInt8(10);

            for (let i = 0; i < 8; i++) {
                loco.functions[5 + i] = (db5 & (1 << i)) !== 0;
            }
        }

        // DB6: F13-F20, F13 bit0
        if (data.length > 11) {
            const db6 = data.readUInt8(11);

            for (let i = 0; i < 8; i++) {
                loco.functions[13 + i] = (db6 & (1 << i)) !== 0;
            }
        }

        // DB7: F21-F28, F21 bit0
        if (data.length > 12) {
            const db7 = data.readUInt8(12);

            for (let i = 0; i < 8; i++) {
                loco.functions[21 + i] = (db7 & (1 << i)) !== 0;
            }
        }

        // DB8: F29-F31, ha hosszabb packet jön
        if (len >= 15 && data.length > 13) {
            const db8 = data.readUInt8(13);

            for (let i = 0; i < 3; i++) {
                loco.functions[29 + i] = (db8 & (1 << i)) !== 0;
            }
        }

        return loco;
    }

    private broadcastLocoState(loco: LocoState): void {
        this.broadcastWs("locoState", {
            loco,
        });
    }

    private broadcastAccessoryChanged(accessory: AccessoryInfo): void {
        this.broadcastWs("accessoryChanged", {
            address: accessory.address,
            active: accessory.active,
        });

        this.broadcastWs("z21AccessoryInfo", {
            address: accessory.address,
            active: accessory.active,
        });
    }

    private isRBusDataChangedPacket(data: Buffer): boolean {
        if (data.length < 15) return false;

        const len = data.readUInt16LE(0);
        const header = data.readUInt16LE(2);

        return len === 0x0f && header === LAN_RMBUS_DATACHANGED;
    }

    private isRBusDataChangedForGroup(data: Buffer, group: number): boolean {
        if (!this.isRBusDataChangedPacket(data)) return false;

        return data.readUInt8(4) === group;
    }

    private containsRBusDataChangedForGroup(buffer: Buffer, group: number): boolean {
        try {
            const packets = this.splitZ21Packets(buffer);

            return packets.some((packet) =>
                this.isRBusDataChangedForGroup(packet, group)
            );
        } catch {
            return false;
        }
    }

    private decodeRBusSensors(
        group: number,
        bytes: number[],
        previousBytes: number[]
    ): RBusSensorInfo[] {
        const changedSensors: RBusSensorInfo[] = [];

        for (let byteIndex = 0; byteIndex < 10; byteIndex++) {
            const currentByte = bytes[byteIndex] ?? 0;
            const previousByte = previousBytes[byteIndex] ?? 0;

            const changedBits = currentByte ^ previousByte;

            if (changedBits === 0) continue;

            for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
                const mask = 1 << bitIndex;

                if ((changedBits & mask) === 0) continue;

                const on = (currentByte & mask) !== 0;

                const moduleAddress = group * 10 + byteIndex + 1;
                const input = bitIndex + 1;

                /**
                 * DCCExpress sensor address.
                 *
                 * Modul 1 input 1..8  => sensor 1..8
                 * Modul 2 input 1..8  => sensor 9..16
                 * ...
                 * Modul 11 input 1..8 => sensor 81..88
                 */
                const address = (moduleAddress - 1) * 8 + input;

                changedSensors.push({
                    address,
                    moduleAddress,
                    input,
                    on,
                    group,
                    byteIndex,
                    bitIndex,
                });
            }
        }

        return changedSensors;
    }

    private broadcastSensorChanged(sensor: RBusSensorInfo): void {
        this.broadcastWs("sensorChanged", {
            address: sensor.address,
            on: sensor.on,
        });

        this.broadcastWs("rbusSensorChanged", sensor);
    }
}

function hasFlag(value: number, flag: number): boolean {
    return (value & flag) === flag;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function clampInt(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;

    return Math.max(min, Math.min(max, Math.round(value)));
}