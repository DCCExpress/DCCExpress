import type http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { AccessoryChangedMessage, CommandCenterInfo, TurnoutChangedMessage, WsMessage } from "../../../common/src/types.js";
import { CommandCenterConfig, readCommandCenter, setCommandCenterConfigLoadedCallback } from "../routes/commandCenterRoutes.js";
import { CommandCenter } from "../commandCenter/CommandCenter.js";
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

function sendToClient(ws: WebSocket, message: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(wss: WebSocketServer, message: unknown, exclude?: WebSocket) {
  const text = JSON.stringify(message);

  for (const client of wss.clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(text);
    }
  }
}

function initCommandCenter(conf: CommandCenterConfig | null) {
  if (commandCenter) {
    commandCenter!.stop().then(() => {
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
      //commandCenter = new Z21CommandCenter("Z21", conf.z21.host!, conf.z21.port!);
      commandCenter = new Z21CommandCenter(
        "Z21",
        conf.z21.host!,
        conf.z21.port!,
        broadcastAll
      );
      commandCenter
        .start()
        .then(() => {
          log("Command center started:", conf?.type);
        })
        .catch((err) => {
          console.error("Failed to start command center:", err);
        });

      break;

    default:
      commandCenter = new CommandCenterSimulator("Simulator");
      break;
  }

}

let commandCenter: CommandCenter | null = null; //new CommandCenterSimulator("Simulator");

setCommandCenterConfigLoadedCallback((conf: CommandCenterConfig | null) => {
  log("Command center config loaded:", conf);
  initCommandCenter(conf);
});

let wss: WebSocketServer;
export function broadcastAll(message: unknown, exclude?: WebSocket) {
  broadcast(wss, message, exclude);
}


export function setupWebSocketServer(server: http.Server) {

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
    let clientUUID: string | null = null;
    sendToClient(ws, {
      type: "ws:welcome",
      data: { message: "Connected" },
    });

    // sendToClient(ws, {
    //   type: "commandCenterInfo",
    //   data: { alive: false }
    // } as CommandCenterInfo)

    if (!commandCenter) {
      sendToClient(ws, {
        type: "commandCenterInfo",
        data: { alive: false },
      } as CommandCenterInfo);
    }

    if (commandCenter) {

      commandCenter.clientConnected();

      sendToClient(ws, {
        type: "commandCenterLockChanged",
        data: {
          locked: commandCenter.locked,
          lockOwner: commandCenter.lockOwnerUUID ?? null,
          reason: commandCenter.locked ? "route" : null,
        },
      });

      const locos = commandCenter.getLocos();
      for (const loco of locos) {
        sendToClient(ws, {
          type: "locoState",
          data: { loco },
        });
      }


      const turnouts = commandCenter.getTurnouts();
      log("Turnouts", turnouts)
      for (const turnout of turnouts) {

        const msg: TurnoutChangedMessage = {
          type: "turnoutChanged",
          data: {
            address: turnout.address,
            closed: turnout.closed,
          },
        };
        sendToClient(ws, msg);
      }

      const accessories = commandCenter.getAccessories();
      for (const accessory of accessories) {

        const msg: AccessoryChangedMessage = {
          type: "accessoryChanged",
          data: {
            address: accessory.address,
            active: accessory.active,
          },
        };
        sendToClient(ws, msg);
      }
    }

    ws.on("message", (message) => {

      const text = message.toString();
      log("WS incoming:", text);



      if (commandCenter) {
        //log("Current command center:", commandCenter.getName());
        try {

          const msg = JSON.parse(text) as WsMessage;

          if (msg.uuid) {
            clientUUID = msg.uuid;
          }


          log("Received message of type:", msg.type);
          switch (msg.type) {

            //===============================
            // LOCK & UNLOCK
            //===============================
            case "routeLock": {
              if (commandCenter.locked && commandCenter.lockOwnerUUID !== msg.uuid) {
                sendToClient(ws, {
                  type: "commandRejected",
                  uuid: msg.uuid,
                  data: {
                    reason: "Command center busy",
                    lockOwner: commandCenter.lockOwnerUUID,
                  },
                });
                return;
              }

              commandCenter.locked = true;
              commandCenter.lockOwnerUUID = msg.uuid;

              broadcast(wss, {
                type: "commandCenterLockChanged",
                data: {
                  locked: true,
                  lockOwner: commandCenter.lockOwnerUUID,

                },
              });

              return;
            }

            case "routeUnlock": {
              if (commandCenter.lockOwnerUUID === msg.uuid) {
                commandCenter.locked = false;
                commandCenter.lockOwnerUUID = null;

                broadcast(wss, {
                  type: "commandCenterLockChanged",
                  data: {
                    locked: false,
                    lockOwner: null,
                  },
                });
              }

              return;
            }


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
                } else {
                  // Optionally, broadcast the new loco state to all clients
                  // commandCenter!.getLoco(address).then(loco => {
                  //   broadcast(wss, {
                  //     type: "locoState",
                  //     data: { loco },
                  //   });
                  // });
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
                } else {
                  // Optionally, broadcast the new loco state to all clients
                  commandCenter!.getLoco(address).then(loco => {
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

            //===============================
            // setTurnout
            //===============================
            case "setTurnout": {

              if (commandCenter.locked && commandCenter.lockOwnerUUID != msg.uuid) {
                ws.send(JSON.stringify({
                  type: "commandRejected",
                  uuid: msg.uuid,
                  data: {
                    reason: "Command center busy",
                    lockOwner: commandCenter.lockOwnerUUID,
                  },

                }));
                return;
              }

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

            //===============================
            // getSensor
            //===============================
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

            //===============================
            // setBasicAccessory
            //===============================
            case "setBasicAccessory": {
              const address = msg.data?.address;
              const active = msg.data?.active;

              if (typeof address !== "number" || typeof active !== "boolean") {
                sendToClient(ws, {
                  type: "error",
                  data: { message: "Invalid setBasicAccessory payload" },
                });
                return;
              }

              commandCenter.setBasicAccessory(address, active).then(success => {
                log("Basic accessory set result:", success);
                if (!success) {
                  broadcast(wss, {
                    type: "error",
                    data: { message: "Failed to set basic accessory" },
                  });
                }
              });
              return;
            }

            //==================================
            // POWER
            //==================================
            case "setTrackPower": {
              const on = msg.data?.on;

              if (typeof on !== "boolean") {
                sendToClient(ws, {
                  type: "error",
                  data: { message: "Invalid setTrackPower payload" },
                });
                return;
              }

              commandCenter.setTrackPower(on).then((success) => {
                log("Set track power result:", success);

                if (!success) {
                  broadcast(wss, {
                    type: "error",
                    data: { message: "Failed to set track power" },
                  });
                }
              });

              return;
            }

            //==================================
            // EMERGENCY STOP
            //==================================
            case "emergencyStop": {
              commandCenter.emergencyStop().then((success) => {
                log("Emergency stop result:", success);

                if (!success) {
                  broadcast(wss, {
                    type: "error",
                    data: { message: "Failed to emergency stop" },
                  });
                }
              });

              return;
            }
            //==================================
            // DEFAULT
            //==================================
            default: {
              logError("Unknown message type:", msg.type);
              sendToClient(ws, {
                type: "error",
                data: { message: "Unknown message type" },
              });
              //broadcast(wss, msg, ws);
              return;
            }
          }

        } catch (error) {
          sendToClient(ws, {
            type: "error",
            data: { message: String(error) },
          });
        }
      } else {
        sendToClient(ws, {
          type: "error",
          data: { message: "No command center available" },
        });
      }
    });

    ws.on("close", () => {
      log("WebSocket client disconnected");

      if (
        commandCenter &&
        clientUUID &&
        commandCenter.lockOwnerUUID === clientUUID
      ) {
        commandCenter.locked = false;
        commandCenter.lockOwnerUUID = null;

        broadcast(wss, {
          type: "commandCenterLockChanged",
          data: {
            locked: false,
            lockOwner: null,
          },
        });
      }
    });
    ws.on("error", (error) => {
      console.error("WebSocket client error:", error);
    });
  });

  return wss;
}