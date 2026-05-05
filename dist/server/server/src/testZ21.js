// import { UdpClient, bufferToHex, type UdpMessage } from "./commandCenter/udpClient.js";
export {};
// //const Z21_HOST = "192.168.0.111";
// const Z21_HOST = "192.168.1.70";
// const Z21_PORT = 21105;
// const LAN_SYSTEMSTATE_GETDATA = 0x0085;
// const LAN_SYSTEMSTATE_DATACHANGED = 0x0084;
// type Z21SystemState = {
//   mainCurrentMa: number;
//   progCurrentMa: number;
//   filteredMainCurrentMa: number;
//   temperatureC: number;
//   supplyVoltageMv: number;
//   vccVoltageMv: number;
//   centralState: number;
//   centralStateEx: number;
//   reserved: number;
//   capabilities: number;
//   flags: {
//     emergencyStop: boolean;
//     trackVoltageOff: boolean;
//     shortCircuit: boolean;
//     programmingModeActive: boolean;
//     highTemperature: boolean;
//     powerLost: boolean;
//     shortCircuitExternal: boolean;
//     shortCircuitInternal: boolean;
//     rcn213: boolean;
//     capDcc: boolean;
//     capMm: boolean;
//     capRailCom: boolean;
//     capLocoCmds: boolean;
//     capAccessoryCmds: boolean;
//     capDetectorCmds: boolean;
//     capNeedsUnlockCode: boolean;
//   };
// };
// function main() {
//   void run();
// }
// async function run() {
//   const udp = new UdpClient({
//     host: Z21_HOST,
//     port: Z21_PORT,
//     timeoutMs: 3000,
//     debug: true,
//   });
//   udp.on("message", (message: UdpMessage) => {
//     console.log(
//       "UDP async/raw:",
//       message.remote.address,
//       message.remote.port,
//       bufferToHex(message.data)
//     );
//   });
//   try {
//     await udp.open();
//     console.log("Z21 status request...");
//     const response = await udp.sendAndReceive(
//       buildZ21Packet(LAN_SYSTEMSTATE_GETDATA),
//       (message) => isZ21Header(message.data, LAN_SYSTEMSTATE_DATACHANGED),
//       3000
//     );
//     console.log("Z21 raw response:", bufferToHex(response.data));
//     const state = parseSystemState(response.data);
//     console.log("");
//     console.log("===== Z21 SYSTEM STATE =====");
//     console.log("Main current:          ", state.mainCurrentMa, "mA");
//     console.log("Prog current:          ", state.progCurrentMa, "mA");
//     console.log("Filtered main current: ", state.filteredMainCurrentMa, "mA");
//     console.log("Temperature:           ", state.temperatureC, "°C");
//     console.log("Supply voltage:        ", state.supplyVoltageMv, "mV");
//     console.log("VCC / track voltage:   ", state.vccVoltageMv, "mV");
//     console.log("CentralState:          ", toHex8(state.centralState));
//     console.log("CentralStateEx:        ", toHex8(state.centralStateEx));
//     console.log("Capabilities:          ", toHex8(state.capabilities));
//     console.log("");
//     console.log("Flags:");
//     console.log("Emergency stop:        ", state.flags.emergencyStop);
//     console.log("Track voltage off:     ", state.flags.trackVoltageOff);
//     console.log("Short circuit:         ", state.flags.shortCircuit);
//     console.log("Programming mode:      ", state.flags.programmingModeActive);
//     console.log("High temperature:      ", state.flags.highTemperature);
//     console.log("Power lost:            ", state.flags.powerLost);
//     console.log("Short circuit external:", state.flags.shortCircuitExternal);
//     console.log("Short circuit internal:", state.flags.shortCircuitInternal);
//     console.log("RCN-213:               ", state.flags.rcn213);
//     console.log("");
//     console.log("Capabilities:");
//     console.log("DCC:                   ", state.flags.capDcc);
//     console.log("MM:                    ", state.flags.capMm);
//     console.log("RailCom:               ", state.flags.capRailCom);
//     console.log("Loco commands:         ", state.flags.capLocoCmds);
//     console.log("Accessory commands:    ", state.flags.capAccessoryCmds);
//     console.log("Detector commands:     ", state.flags.capDetectorCmds);
//     console.log("Needs unlock code:     ", state.flags.capNeedsUnlockCode);
//   } finally {
//     udp.close();
//   }
// }
// function buildZ21Packet(header: number, data?: Buffer): Buffer {
//   const payload = data ?? Buffer.alloc(0);
//   const length = 4 + payload.length;
//   const packet = Buffer.alloc(length);
//   // DataLen UINT16 little endian
//   packet.writeUInt16LE(length, 0);
//   // Header UINT16 little endian
//   packet.writeUInt16LE(header, 2);
//   payload.copy(packet, 4);
//   return packet;
// }
// function isZ21Header(buffer: Buffer, header: number): boolean {
//   if (buffer.length < 4) return false;
//   const packetLength = buffer.readUInt16LE(0);
//   const packetHeader = buffer.readUInt16LE(2);
//   return packetLength <= buffer.length && packetHeader === header;
// }
// function parseSystemState(buffer: Buffer): Z21SystemState {
//   if (!isZ21Header(buffer, LAN_SYSTEMSTATE_DATACHANGED)) {
//     throw new Error(
//       `Invalid Z21 system state response header: ${bufferToHex(buffer)}`
//     );
//   }
//   const packetLength = buffer.readUInt16LE(0);
//   if (packetLength < 20 || buffer.length < 20) {
//     throw new Error(
//       `Invalid Z21 system state response length: packetLength=${packetLength}, bufferLength=${buffer.length}`
//     );
//   }
//   const dataOffset = 4;
//   const mainCurrentMa = buffer.readInt16LE(dataOffset + 0);
//   const progCurrentMa = buffer.readInt16LE(dataOffset + 2);
//   const filteredMainCurrentMa = buffer.readInt16LE(dataOffset + 4);
//   const temperatureC = buffer.readInt16LE(dataOffset + 6);
//   const supplyVoltageMv = buffer.readUInt16LE(dataOffset + 8);
//   const vccVoltageMv = buffer.readUInt16LE(dataOffset + 10);
//   const centralState = buffer.readUInt8(dataOffset + 12);
//   const centralStateEx = buffer.readUInt8(dataOffset + 13);
//   const reserved = buffer.readUInt8(dataOffset + 14);
//   const capabilities = buffer.readUInt8(dataOffset + 15);
//   return {
//     mainCurrentMa,
//     progCurrentMa,
//     filteredMainCurrentMa,
//     temperatureC,
//     supplyVoltageMv,
//     vccVoltageMv,
//     centralState,
//     centralStateEx,
//     reserved,
//     capabilities,
//     flags: {
//       emergencyStop: hasFlag(centralState, 0x01),
//       trackVoltageOff: hasFlag(centralState, 0x02),
//       shortCircuit: hasFlag(centralState, 0x04),
//       programmingModeActive: hasFlag(centralState, 0x20),
//       highTemperature: hasFlag(centralStateEx, 0x01),
//       powerLost: hasFlag(centralStateEx, 0x02),
//       shortCircuitExternal: hasFlag(centralStateEx, 0x04),
//       shortCircuitInternal: hasFlag(centralStateEx, 0x08),
//       rcn213: hasFlag(centralStateEx, 0x20),
//       capDcc: hasFlag(capabilities, 0x01),
//       capMm: hasFlag(capabilities, 0x02),
//       capRailCom: hasFlag(capabilities, 0x08),
//       capLocoCmds: hasFlag(capabilities, 0x10),
//       capAccessoryCmds: hasFlag(capabilities, 0x20),
//       capDetectorCmds: hasFlag(capabilities, 0x40),
//       capNeedsUnlockCode: hasFlag(capabilities, 0x80),
//     },
//   };
// }
// function hasFlag(value: number, flag: number): boolean {
//   return (value & flag) === flag;
// }
// function toHex8(value: number): string {
//   return `0x${value.toString(16).padStart(2, "0")}`;
// }
// main();
