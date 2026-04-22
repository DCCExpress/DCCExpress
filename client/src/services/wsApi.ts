// src/services/wsApi.ts

import { wsClient } from "./wsClient";

export const wsApi = {
  connect(url: string) {
    wsClient.connect(url);
  },

  disconnect() {
    wsClient.disconnect();
  },

  send(type: string, data?: any) {
    return wsClient.send({ type, data });
  },

  powerOn() {
    return wsClient.send({ type: "powerOn" });
  },

  powerOff() {
    return wsClient.send({ type: "powerOff" });
  },

  setLoco(data: { address: number; speed: number; direction: boolean }) {
    return wsClient.send({ type: "setLoco", data });
  },

  setLocoFunction(data: {
    locoId: string;
    address: number;
    functionNumber: number;
    active: boolean;
    momentary?: boolean;
  }) {
    return wsClient.send({ type: "setLocoFunction", data });
  },

  setTurnout(data: {address: number, closed: boolean }) {
    return wsClient.send({ type: "setTurnout", data });
  },

};