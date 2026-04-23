// src/services/wsApi.ts
import { wsClient } from "./wsClient";
export const wsApi = {
    connect(url) {
        wsClient.connect(url);
    },
    disconnect() {
        wsClient.disconnect();
    },
    send(type, data) {
        return wsClient.send({ type, data });
    },
    powerOn() {
        return wsClient.send({ type: "powerOn" });
    },
    powerOff() {
        return wsClient.send({ type: "powerOff" });
    },
    setLoco(data) {
        return wsClient.send({ type: "setLoco", data });
    },
    setLocoFunction(data) {
        return wsClient.send({ type: "setLocoFunction", data });
    },
    setTurnout(data) {
        return wsClient.send({ type: "setTurnout", data });
    },
};
