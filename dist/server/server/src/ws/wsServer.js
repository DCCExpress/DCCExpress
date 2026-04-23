import { WebSocketServer, WebSocket } from "ws";
import { setCommandCenterConfigLoadedCallback } from "../routes/commandCenterRoutes.js";
import { CommandCenterSimulator } from "../commandCenter/simulator.js";
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
let commandCenter = new CommandCenterSimulator("Simulator");
setCommandCenterConfigLoadedCallback((conf) => {
    console.log("Command center config loaded:", conf);
});
export function setupWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
    });
    wss.on("connection", (ws, req) => {
        console.log("WebSocket client connected:", req.socket.remoteAddress);
        sendToClient(ws, {
            type: "ws:welcome",
            data: { message: "Connected" },
        });
        sendToClient(ws, {
            type: "commandCenterInfo",
            data: { alive: false }
        });
        ws.on("message", (message) => {
            try {
                const text = message.toString();
                console.log("WS message:", text);
                const msg = JSON.parse(text);
                switch (msg.type) {
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
                        // Itt később majd valódi hardver/logika kezelés jöhet
                        // pl. setTurnout(address, closed);
                        broadcast(wss, {
                            type: "turnoutChanged",
                            data: {
                                address,
                                closed,
                            },
                        });
                        commandCenter?.setTurnout(address, closed).then(success => {
                            console.log("Turnout set result:", success);
                            if (!success) {
                                broadcast(wss, {
                                    type: "error",
                                    data: { message: "Failed to set turnout" },
                                });
                            }
                            else {
                                broadcast(wss, {
                                    type: "turnoutChanged",
                                    data: {
                                        address,
                                        closed,
                                    },
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
                        // Itt később majd valódi hardver/logika kezelés jöhet
                        // pl. setSensor(address, on);
                        broadcast(wss, {
                            type: "sensorChanged",
                            data: {
                                address,
                                on,
                            },
                        });
                        return;
                    }
                    default: {
                        // minden más mehet tovább, ha akarod
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
        });
        ws.on("close", () => {
            console.log("WebSocket client disconnected");
        });
        ws.on("error", (error) => {
            console.error("WebSocket client error:", error);
        });
    });
    return wss;
}
