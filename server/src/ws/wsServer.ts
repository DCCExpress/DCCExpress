/**
 * WebSocket Server for DCCExpress
 * 
 * Handles real-time communication between web clients and command center.
 * Routes messages from clients to the CommandCenterManager.
 */

import type http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { commandCenterManager } from "../commandCenter/index.js";

// ============= MESSAGE TYPES =============

type SetTurnoutMessage = {
  type: "setTurnout";
  data: {
    address: number;
    closed: boolean;
  };
};

type SetSensorMessage = {
  type: "setSensor";
  data: {
    address: number;
    on: boolean;
  };
};

type SetLocoMessage = {
  type: "setLoco";
  data: {
    address: number;
    speed: number;
    direction: "forward" | "reverse";
  };
};

type SetLocoFunctionMessage = {
  type: "setLocoFunction";
  data: {
    address: number;
    fn: number;
    active: boolean;
  };
};

type PowerMessage = {
  type: "powerOn" | "powerOff";
};

type ClientMessage =
  | SetTurnoutMessage
  | SetSensorMessage
  | SetLocoMessage
  | SetLocoFunctionMessage
  | PowerMessage
  | {
      type: string;
      data?: any;
    };

// ============= SERVER MESSAGE TYPES =============

type ServerMessage = {
  type: string;
  data?: any;
};

// ============= HELPER FUNCTIONS =============

function sendToClient(ws: WebSocket, message: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    console.log("[WS] Sent to client:", message.type);
  }
}

function broadcast(wss: WebSocketServer, message: ServerMessage, exclude?: WebSocket) {
  const text = JSON.stringify(message);

  let count = 0;
  for (const client of wss.clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(text);
      count++;
    }
  }

  console.log(`[WS] Broadcast "${message.type}" to ${count} client(s)`);
}

export function setupWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  wss.on("connection", (ws, req) => {
    console.log("[WS] Client connected:", req.socket.remoteAddress);

    // Send welcome message
    sendToClient(ws, {
      type: "ws:welcome",
      data: { message: "Connected to DCCExpress server" },
    });

    // Send command center info
    sendToClient(ws, {
      type: "commandCenterInfo",
      data: {
        name: commandCenterManager.getName(),
        connection: commandCenterManager.getConnectionString(),
        connected: commandCenterManager.isConnected(),
      },
    });

    // Notify command center
    commandCenterManager.clientConnected();

    ws.on("message", async (message) => {
      try {
        const text = message.toString();
        console.log("[WS] Message received:", text);

        const msg = JSON.parse(text) as ClientMessage;

        // TURNOUT COMMANDS
        if (msg.type === "setTurnout") {
          const { address, closed } = (msg as SetTurnoutMessage).data;

          if (typeof address !== "number" || typeof closed !== "boolean") {
            sendToClient(ws, {
              type: "error",
              data: { message: "Invalid setTurnout: address and closed required" },
            });
            return;
          }

          // ✅ Send to command center
          const success = await commandCenterManager.setTurnout(address, closed);

          if (success) {
            broadcast(wss, {
              type: "turnoutChanged",
              data: { address, closed },
            });
            console.log(`[WS] Turnout ${address} set to ${closed ? "closed" : "open"}`);
          } else {
            sendToClient(ws, {
              type: "error",
              data: { message: "Failed to set turnout" },
            });
          }
          return;
        }

        // SENSOR COMMANDS
        if (msg.type === "setSensor") {
          const { address, on } = (msg as SetSensorMessage).data;

          if (typeof address !== "number" || typeof on !== "boolean") {
            sendToClient(ws, {
              type: "error",
              data: { message: "Invalid setSensor: address and on required" },
            });
            return;
          }

          // Note: setSensor would be implemented in CommandCenter
          broadcast(wss, {
            type: "sensorChanged",
            data: { address, on },
          });
          console.log(`[WS] Sensor ${address} set to ${on ? "on" : "off"}`);
          return;
        }

        // LOCO SPEED COMMANDS
        if (msg.type === "setLoco") {
          const { address, speed, direction } = (msg as SetLocoMessage).data;

          if (typeof address !== "number" || typeof speed !== "number") {
            sendToClient(ws, {
              type: "error",
              data: { message: "Invalid setLoco: address and speed required" },
            });
            return;
          }

          // ✅ Send to command center
          const success = await commandCenterManager.setLoco(
            address,
            speed,
            direction || "forward"
          );

          if (success) {
            broadcast(wss, {
              type: "locoChanged",
              data: { address, speed, direction: direction || "forward" },
            });
            console.log(`[WS] Loco ${address} speed set to ${speed}`);
          } else {
            sendToClient(ws, {
              type: "error",
              data: { message: "Failed to set loco speed" },
            });
          }
          return;
        }

        // LOCO FUNCTION COMMANDS
        if (msg.type === "setLocoFunction") {
          const { address, fn, active } = (msg as SetLocoFunctionMessage).data;

          if (typeof address !== "number" || typeof fn !== "number") {
            sendToClient(ws, {
              type: "error",
              data: {
                message: "Invalid setLocoFunction: address and fn required",
              },
            });
            return;
          }

          // ✅ Send to command center
          const success = await commandCenterManager.setLocoFunction(
            address,
            fn,
            active || false
          );

          if (success) {
            broadcast(wss, {
              type: "locoFunctionChanged",
              data: { address, fn, active: active || false },
            });
            console.log(
              `[WS] Loco ${address} function ${fn} set to ${active ? "on" : "off"}`
            );
          } else {
            sendToClient(ws, {
              type: "error",
              data: { message: "Failed to set loco function" },
            });
          }
          return;
        }

        // POWER ON
        if (msg.type === "powerOn") {
          const success = await commandCenterManager.setTrackPower(true);

          if (success) {
            broadcast(wss, {
              type: "powerChanged",
              data: { on: true },
            });
            console.log("[WS] Track power: ON");
          } else {
            sendToClient(ws, {
              type: "error",
              data: { message: "Failed to turn on power" },
            });
          }
          return;
        }

        // POWER OFF
        if (msg.type === "powerOff") {
          const success = await commandCenterManager.setTrackPower(false);

          if (success) {
            broadcast(wss, {
              type: "powerChanged",
              data: { on: false },
            });
            console.log("[WS] Track power: OFF");
          } else {
            sendToClient(ws, {
              type: "error",
              data: { message: "Failed to turn off power" },
            });
          }
          return;
        }

        // UNKNOWN MESSAGE TYPE
        console.warn(`[WS] Unknown message type: ${msg.type}`);
        sendToClient(ws, {
          type: "error",
          data: {
            message: `Unknown message type: ${msg.type}`,
          },
        });
      } catch (error) {
        console.error("[WS] Message processing error:", error);
        sendToClient(ws, {
          type: "error",
          data: { message: String(error) },
        });
      }
    });

    ws.on("close", () => {
      console.log("[WS] Client disconnected");
    });

    ws.on("error", (error) => {
      console.error("[WS] Socket error:", error);
    });
  });

  console.log("[WS] WebSocket server initialized on /ws");
  return wss;
}