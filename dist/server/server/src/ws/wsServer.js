import { WebSocketServer, WebSocket } from "ws";
import { readCommandCenter, setCommandCenterConfigLoadedCallback } from "../routes/commandCenterRoutes.js";
import { CommandCenterSimulator } from "../commandCenter/simulator.js";
import { Z21CommandCenter } from "../commandCenter/z21CommandCenter.js";
import { log, logError } from "../utility.js";
// type SetTurnoutMessage = {
//   type: "setTurnout";
//   data: {
//     address: number;
//     closed: boolean;
//   };
// };
// type SetSensorMessage = {
//   type: "setSensor";
//   data: {
//     address: number;
//     on: boolean;
//   };
// };
// type CommandCenterInfo = {
//   type: "commandCenterInfo";
//   data: {
//     type: string;
//     alive: boolean;
//   }
// }
// type WsMessage =
//   | SetTurnoutMessage
//   | SetSensorMessage
//   | {
//       type: string;
//       data?: any;
//     };
function sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}
function broadcast(wss, message, exclude) {
    const text = JSON.stringify(message);
    for (const client of wss.clients) {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(text);
        }
    }
}
function initCommandCenter(conf) {
    if (commandCenter) {
        commandCenter.stop().then(() => {
            log("Previous command center stopped");
        });
    }
    switch (conf?.type) {
        case "simulator":
            log("Starting command center:", conf.type);
            commandCenter = new CommandCenterSimulator("Simulator");
            commandCenter.start().then(() => {
                log("Command center started:", conf.type);
            }).catch(err => {
                console.error("Failed to start command center:", err);
            });
            break;
        case "z21":
            log("Starting command center:", "Z21");
            commandCenter = new Z21CommandCenter("Z21", conf.z21.host, conf.z21.port);
            commandCenter.start().then(() => {
                log("Command center started:", conf?.type);
            }).catch(err => {
                console.error("Failed to start command center:", err);
            });
            break;
        default:
            commandCenter = new CommandCenterSimulator("Simulator");
            break;
    }
}
let commandCenter = null; //new CommandCenterSimulator("Simulator");
setCommandCenterConfigLoadedCallback((conf) => {
    log("Command center config loaded:", conf);
    initCommandCenter(conf);
});
let wss;
export function broadcastAll(message, exclude) {
    broadcast(wss, message, exclude);
}
export function setupWebSocketServer(server) {
    readCommandCenter().then(conf => {
        log("Initial command center config:", conf);
        initCommandCenter(conf);
    }).catch(err => {
        logError("Failed to read initial command center config:", err);
    });
    wss = new WebSocketServer({
        server,
        path: "/ws",
    });
    wss.on("connection", (ws, req) => {
        log("WebSocket client connected:", req.socket.remoteAddress);
        sendToClient(ws, {
            type: "ws:welcome",
            data: { message: "Connected" },
        });
        sendToClient(ws, {
            type: "commandCenterInfo",
            data: { alive: false }
        });
        if (commandCenter) {
            const locos = commandCenter.getLocos();
            for (const loco of locos) {
                sendToClient(ws, {
                    type: "locoState",
                    data: { loco },
                });
            }
        }
        ws.on("message", (message) => {
            const text = message.toString();
            log("WS incoming:", text);
            if (commandCenter) {
                //log("Current command center:", commandCenter.getName());
                try {
                    const msg = JSON.parse(text);
                    log("Received message of type:", msg.type);
                    switch (msg.type) {
                        //===============================
                        // setLoco
                        //===============================
                        case "setLoco": {
                            const address = msg.data?.locoAddress;
                            const speed = msg.data?.speed;
                            const direction = msg.data?.direction;
                            if (typeof address !== "number" || typeof speed !== "number" || (direction !== "forward" && direction !== "reverse")) {
                                logError("Invalid setLoco payload:", msg.data);
                                sendToClient(ws, {
                                    type: "error",
                                    data: { message: "Invalid setLoco payload" },
                                });
                                return;
                            }
                            commandCenter.setLoco(address, speed, direction).then(success => {
                                log("Set loco result:", success);
                                if (!success) {
                                    broadcast(wss, {
                                        type: "error",
                                        data: { message: "Failed to set loco" },
                                    });
                                }
                                else {
                                    // Optionally, broadcast the new loco state to all clients
                                    commandCenter.getLoco(address).then(loco => {
                                        broadcast(wss, {
                                            type: "locoState",
                                            data: { loco },
                                        });
                                    });
                                }
                            });
                            return;
                        }
                        //===============================
                        // setLocoFunction
                        //===============================
                        case "setLocoFunction": {
                            const address = msg.data?.locoAddress;
                            const fn = msg.data?.functionNumber;
                            const active = msg.data?.active;
                            if (typeof address !== "number" || typeof fn !== "number" || typeof active !== "boolean") {
                                logError("Invalid setLocoFunction payload:", msg.data);
                                sendToClient(ws, {
                                    type: "error",
                                    data: { message: "Invalid setLocoFunction payload" },
                                });
                                return;
                            }
                            commandCenter.setLocoFunction(address, fn, active).then(success => {
                                log("Set loco function result:", success);
                                if (!success) {
                                    broadcast(wss, {
                                        type: "error",
                                        data: { message: "Failed to set loco function" },
                                    });
                                }
                                else {
                                    // Optionally, broadcast the new loco state to all clients
                                    commandCenter.getLoco(address).then(loco => {
                                        log("Broadcasting loco state after function change:", loco);
                                        broadcast(wss, {
                                            type: "locoState",
                                            data: { loco },
                                        });
                                    });
                                }
                            });
                            return;
                        }
                        //===============================
                        // getLoco
                        //===============================
                        case "getLoco": {
                            const address = msg.data?.locoAddress;
                            if (typeof address !== "number") {
                                sendToClient(ws, {
                                    type: "error",
                                    data: { message: "Invalid getLoco payload" },
                                });
                                return;
                            }
                            commandCenter.getLoco(address).then(loco => {
                                log("getLoco result:", loco);
                                sendToClient(ws, {
                                    type: "locoState",
                                    data: { loco },
                                });
                            }).catch(err => {
                                logError("Failed to get loco:", err);
                                sendToClient(ws, {
                                    type: "error",
                                    data: { message: "Failed to get loco" },
                                });
                            });
                            return;
                        }
                        case "setTurnout": {
                            const address = msg.data?.address;
                            const closed = msg.data?.closed;
                            if (typeof address !== "number" || typeof closed !== "boolean") {
                                sendToClient(ws, {
                                    type: "error",
                                    data: { message: "Invalid setTurnout payload" },
                                });
                                return;
                            }
                            commandCenter.setTurnout(address, closed).then(success => {
                                log("Turnout set result:", success);
                                if (!success) {
                                    broadcast(wss, {
                                        type: "error",
                                        data: { message: "Failed to set turnout" },
                                    });
                                }
                            });
                            return;
                        }
                        case "setSensor": {
                            const address = msg.data?.address;
                            const on = msg.data?.on;
                            if (typeof address !== "number" || typeof on !== "boolean") {
                                sendToClient(ws, {
                                    type: "error",
                                    data: { message: "Invalid setSensor payload" },
                                });
                                return;
                            }
                            return;
                        }
                        default: {
                            broadcast(wss, msg, ws);
                            return;
                        }
                    }
                }
                catch (error) {
                    sendToClient(ws, {
                        type: "error",
                        data: { message: String(error) },
                    });
                }
            }
            else {
                sendToClient(ws, {
                    type: "error",
                    data: { message: "No command center available" },
                });
            }
        });
        ws.on("close", () => {
            log("WebSocket client disconnected");
        });
        ws.on("error", (error) => {
            console.error("WebSocket client error:", error);
        });
    });
    return wss;
}
