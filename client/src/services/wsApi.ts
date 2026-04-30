// src/services/wsApi.ts

import { Direction, SetTurnoutMessage } from "../../../common/src/types";
import { generateId } from "../helpers";
import { wsClient } from "./wsClient";


class WebscoketApi {


  uuid = generateId();
  constructor() { }

  get clientUuid() {
    return this.uuid;
  }
  connect(url: string) {
    wsClient.connect(url);
  };

  disconnect() {
    wsClient.disconnect();
  };

  send(type: string, data: any) {
    return wsClient.send({ type, data, uuid: this.uuid });
  };

  // powerOn() {
  //   return wsClient.send({ type: "powerOn", uuid: this.uuid });
  // };

  // powerOff() {
  //   return wsClient.send({ type: "powerOff", uuid: this.uuid });
  // };

  // emergencyStop() {
  //   return wsClient.send({ type: "emergencyStop", uuid: this.uuid });
  // };

  setTrackPower(on: boolean) {
    this.send("setTrackPower", { on });
  }

  powerOn() {
    this.setTrackPower(true);
  }

  powerOff() {
    this.setTrackPower(false);
  }

  emergencyStop() {
    this.send("emergencyStop", {});
  }
  setLoco(locoAddress: number, speed: number, direction: Direction) {
    const data = { locoAddress, speed, direction };
    return wsClient.send({ type: "setLoco", data, uuid: this.uuid });
  };

  getLoco(locoAddress: number) {
    return wsClient.send({ type: "getLoco", data: { locoAddress }, uuid: this.uuid });
  };


  setLocoFunction(locoAddress: number, functionNumber: number, active: boolean) {
    const data = { locoAddress, functionNumber, active };
    return wsClient.send({ type: "setLocoFunction", data, uuid: this.uuid });
  };

  setTurnout(address: number, closed: boolean) {
    const data = { type: "setTurnout", data: { address: address, closed: closed }, uuid: this.uuid };
    return wsClient.send(data);
  };

  setBasicAccessory(address: number, active: boolean) {
    const data = { address, active };
    return wsClient.send({ type: "setBasicAccessory", data, uuid: this.uuid });
  };

  routeLock() {
    return wsClient.send({ type: "routeLock", uuid: this.uuid })
  };

  routeUnlock() {
    return wsClient.send({ type: "routeUnlock", uuid: this.uuid })

  };

}

export const wsApi = new WebscoketApi();
