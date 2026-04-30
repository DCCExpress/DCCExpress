import { Console } from "node:console";
import { AccessoryChangedMessage, Loco, SetLocoFunctionMessage, SetLocoMessage, TurnoutChangedMessage, WsMessage } from "../../../common/src/types.js";
import { CommandCenter, LocoState, SensorInfo, TurnoutInfo } from "./CommandCenter.js";
import { log } from "../utility.js";
import { broadcastAll } from "../ws/wsServer.js";

export class CommandCenterSimulator extends CommandCenter {
  getSystemState() {
    throw new Error("Method not implemented.");
  }

  alive: boolean = false;
  aliveTask: NodeJS.Timeout | null = null;
  start(): Promise<boolean> {
    log("Starting command center simulator...");
    this.alive = true;
    this.power = true;
    this.aliveTask = setInterval(() => {

      const msg: WsMessage = {
        type: "commandCenterInfo",
        data: {
          alive: this.alive,
          power: this.power,
          type: "simulator",
        },
        uuid: this.lockOwnerUUID
      };
      broadcastAll(msg);

    }, 1000);
    return Promise.resolve(true);
  }
  stop(): Promise<boolean> {
    log("Stopping command center simulator...");
    this.alive = false;
    this.power = false;
    if (this.aliveTask) {
      clearInterval(this.aliveTask);
      this.aliveTask = null;
      const msg: WsMessage = {
        type: "commandCenterInfo",
        data: {
          alive: this.alive,
          power: this.power,
          type: "simulator",
        },
        uuid: this.lockOwnerUUID
      };
      broadcastAll(msg);
    }
    return Promise.resolve(true);
  }
  getConnectionString(): string {
    throw new Error("Method not implemented.");
  }
  clientConnected(): void {
    throw new Error("Method not implemented.");
  }
  
  setTurnout(address: number, closed: boolean): Promise<boolean> {
    console.log("Sim: setTurnout", { address, closed });
    const turnout = this.getOrCreateTurnout(address);
    turnout.closed = closed;

    const msg: TurnoutChangedMessage = {
      type: "turnoutChanged",
      data: {
        address,
        closed,
      },
    };

    broadcastAll(msg);

    return Promise.resolve(true);
  }
  getTurnout(address: number): Promise<TurnoutInfo | null> {
    throw new Error("Method not implemented.");
  }
  setLoco(address: number, speed: number, direction: "forward" | "reverse"): Promise<boolean> {
    const loco = this.getOrCreateLoco(address);
    loco.speed = speed;
    loco.direction = direction;
    return Promise.resolve(true);
  }
  setLocoFunction(address: number, fn: number, active: boolean): Promise<boolean> {
    const loco = this.getOrCreateLoco(address);
    loco.functions[fn] = active;
    return Promise.resolve(true);
  }
  getLoco(address: number): Promise<LocoState | null> {
    return Promise.resolve(this.getOrCreateLoco(address) ?? null);
  }

  setBasicAccessory(address: number, active: boolean): Promise<boolean> {
    log("Sim: setBasicAccessory", { address, active });
    const accessory = this.getOrCreateAccessory(address);
    accessory.active = active;

   const msg: AccessoryChangedMessage = {
      type: "accessoryChanged",
      data: {
        address,
        active,
      },
    };

    broadcastAll(msg);

    return Promise.resolve(true);
  }

  setTrackPower(on: boolean): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  emergencyStop(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  getSensor(address: number): Promise<SensorInfo | null> {
    throw new Error("Method not implemented.");
  }
  private power: boolean = false;
  private sensorTimer: NodeJS.Timeout | null = null;

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

  private randomSensorTick() {
    if (!this.power) return;

    const address = Math.floor(Math.random() * 8) + 1;
    const current = this.sensors.get(address) ?? false;
    const next = !current;

    //this.sensors.set(address, next);

    // this.emit("sensorChanged", {
    //   address,
    //   on: next,
    // });
  }

  private broadcastInfo() {
    // this.emit("commandCenterInfo", {
    //   alive: this.alive,
    //   power: this.power,
    //   type: "simulator",
    // });
  }

  private emit(t: any, data: any) {
    //     type: K,
    //     data: ServerToClientEvents[K]
    //   ) {
    //     this.broadcaster(type, data);
  }
}