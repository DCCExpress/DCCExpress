import { CommandCenter } from "./CommandCenter.js";
import { log } from "../utility.js";
import { broadcastAll } from "../ws/wsServer.js";
export class CommandCenterSimulator extends CommandCenter {
    alive = false;
    aliveTask = null;
    start() {
        log("Starting command center simulator...");
        this.alive = true;
        this.power = true;
        this.aliveTask = setInterval(() => {
            const msg = {
                type: "commandCenterInfo",
                data: {
                    alive: this.alive,
                    power: this.power,
                    type: "simulator",
                }
            };
            broadcastAll(msg);
        }, 1000);
        return Promise.resolve(true);
    }
    stop() {
        log("Stopping command center simulator...");
        this.alive = false;
        this.power = false;
        if (this.aliveTask) {
            clearInterval(this.aliveTask);
            this.aliveTask = null;
            const msg = {
                type: "commandCenterInfo",
                data: {
                    alive: this.alive,
                    power: this.power,
                    type: "simulator",
                }
            };
            broadcastAll(msg);
        }
        return Promise.resolve(true);
    }
    getConnectionString() {
        throw new Error("Method not implemented.");
    }
    clientConnected() {
        throw new Error("Method not implemented.");
    }
    setTurnout(address, closed) {
        console.log("Sim: setTurnout", { address, closed });
        const msg = {
            type: "turnoutChanged",
            data: {
                address,
                closed,
            },
        };
        broadcastAll(msg);
        return Promise.resolve(true);
    }
    getTurnout(address) {
        throw new Error("Method not implemented.");
    }
    setLoco(address, speed, direction) {
        const loco = this.getOrCreateLoco(address);
        loco.speed = speed;
        loco.direction = direction;
        return Promise.resolve(true);
    }
    setLocoFunction(address, fn, active) {
        const loco = this.getOrCreateLoco(address);
        loco.functions[fn] = active;
        return Promise.resolve(true);
    }
    getLoco(address) {
        return Promise.resolve(this.getOrCreateLoco(address) ?? null);
    }
    setTrackPower(on) {
        throw new Error("Method not implemented.");
    }
    emergencyStop() {
        throw new Error("Method not implemented.");
    }
    getSensor(address) {
        throw new Error("Method not implemented.");
    }
    power = false;
    sensorTimer = null;
    //   constructor(private broadcaster: BroadcastFn) {}
    // start() {
    //   this.broadcastInfo();
    //   this.sensorTimer = setInterval(() => {
    //     this.randomSensorTick();
    //   }, 5000);
    // }
    // stop() {
    //   if (this.sensorTimer) {
    //     clearInterval(this.sensorTimer);
    //     this.sensorTimer = null;
    //   }
    // }
    sendInitialState() {
        this.broadcastInfo();
        for (const [address, loco] of this.locos.entries()) {
            this.emit("locoChanged", {
                address,
                speed: loco.speed,
                direction: loco.direction,
                functions: loco.functions,
            });
            //   for (const [fn, active] of Object.entries(loco.functions)) {
            //     this.emit("locoFunctionChanged", {
            //       locoId: `sim-${address}`,
            //       address,
            //       functionNumber: Number(fn),
            //       active,
            //     });
            //   }
        }
        for (const [address, closed] of this.turnouts.entries()) {
            this.emit("turnoutChanged", { address, closed });
        }
        for (const [address, on] of this.sensors.entries()) {
            this.emit("sensorChanged", { address, on });
        }
    }
    // private handleSetLoco(msg: SetLocoMessage) {
    //   const loco = this.getOrCreateLoco(msg.data.address);
    //   loco.speed = msg.data.speed;
    //   loco.direction = msg.data.direction;
    //   this.emit("locoChanged", {
    //     address: msg.data.address,
    //     speed: msg.data.speed,
    //     direction: msg.data.direction,
    //   });
    // }
    // private handleSetLocoFunction(msg: SetLocoFunctionMessage) {
    //   //const loco = this.getOrCreateLoco(msg.data.fn);
    //   //loco.functions[data.functionNumber] = msg.data.on;
    //   // this.emit("locoFunctionChanged", {
    //   //   locoId: data.locoId,
    //   //   address: data.address,
    //   //   functionNumber: data.functionNumber,
    //   //   active: data.active,
    //   //   momentary: data.momentary,
    //   // });
    //   // if (data.momentary && data.active) {
    //   //   setTimeout(() => {
    //   //     loco.functions[data.functionNumber] = false;
    //   //     this.emit("locoFunctionChanged", {
    //   //       locoId: data.locoId,
    //   //       address: data.address,
    //   //       functionNumber: data.functionNumber,
    //   //       active: false,
    //   //       momentary: true,
    //   //     });
    //   //   }, 500);
    //   // }
    // }
    // private getOrCreateLoco(address: number): LocoState {
    //   let loco = this.locos.get(address);
    //   if (!loco) {
    //     loco = {
    //       address,
    //       speed: 0,
    //       direction: "forward",
    //       functions: {},
    //     };
    //     this.locos.set(address, loco);
    //   }
    //   return loco!;
    // }
    randomSensorTick() {
        if (!this.power)
            return;
        const address = Math.floor(Math.random() * 8) + 1;
        const current = this.sensors.get(address) ?? false;
        const next = !current;
        //this.sensors.set(address, next);
        // this.emit("sensorChanged", {
        //   address,
        //   on: next,
        // });
    }
    broadcastInfo() {
        // this.emit("commandCenterInfo", {
        //   alive: this.alive,
        //   power: this.power,
        //   type: "simulator",
        // });
    }
    emit(t, data) {
        //     type: K,
        //     data: ServerToClientEvents[K]
        //   ) {
        //     this.broadcaster(type, data);
    }
}
