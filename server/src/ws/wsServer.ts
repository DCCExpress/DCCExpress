import type http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { CommandCenterInfo, WsMessage } from "../../../common/src/types.js";

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

export function setupWebSocketServer(server: http.Server) {
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
      data: {alive: false}
    } as CommandCenterInfo)

    ws.on("message", (message) => {
      try {
        const text = message.toString();
        console.log("WS message:", text);

        const msg = JSON.parse(text) as WsMessage;

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
      } catch (error) {
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