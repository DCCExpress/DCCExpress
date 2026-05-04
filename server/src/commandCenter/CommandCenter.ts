import { Dir } from "node:fs";
import { Direction } from "../../../common/src/types.js";
import { readLocos } from "../routes/locoRoutes.js";
import { log } from "../utility.js";

export interface PowerInfo {
  trackVoltageOn: boolean;
  emergencyStop: boolean;
  shortCircuit: boolean;
  current: number;
}

export interface LocoState {
  address: number;
  speed: number;
  direction: Direction;
  functions: { [fn: number]: boolean };
}

export interface TurnoutInfo {
  address: number;
  closed: boolean;
}

export interface SensorInfo {
  address: number;
  active: boolean;
}

export interface AccessoryInfo {
  address: number;
  active: boolean;
}

export type RBusInfo = {
  group: number;
  bytes: number[];
};

export type RBusSensorInfo = {
  address: number;
  moduleAddress: number;
  input: number;
  on: boolean;
  group: number;
  byteIndex: number;
  bitIndex: number;
};


export abstract class CommandCenter {
  protected name: string;
  protected powerInfo: PowerInfo = {
    trackVoltageOn: false,
    emergencyStop: false,
    shortCircuit: false,
    current: 0,
  };


  protected locos: Map<number, LocoState> = new Map();
  protected turnouts: Map<number, TurnoutInfo> = new Map();
  protected sensors: Map<number, SensorInfo> = new Map();
  protected accessories: Map<number, AccessoryInfo> = new Map();
  protected readonly rbusGroups = new Map<number, number[]>();
  public locked: boolean = false;
  public lockOwnerUUID: string | null = "";

  constructor(name: string) {
    this.name = name;
  }

  abstract getConnectionString(): string;
  abstract start(): Promise<boolean>;
  abstract stop(): Promise<boolean>;
  abstract clientConnected(): void;

  abstract setTurnout(address: number, closed: boolean): Promise<boolean>;
  abstract getTurnout(address: number): Promise<TurnoutInfo | null>;

  abstract setLoco(address: number, speed: number, direction: "forward" | "reverse"): Promise<boolean>;
  abstract setLocoFunction(address: number, fn: number, active: boolean): Promise<boolean>;

  protected getOrCreateLoco(address: number): LocoState {
    let loco = this.locos.get(address);

    if (!loco) {
      loco = {
        address,
        speed: 0,
        direction: "forward",
        functions: {},
      };

      this.locos.set(address, loco);
    }

    return loco;
  }

  abstract getLoco(address: number): Promise<LocoState | null>;

  getLocos(): LocoState[] {
    return Array.from(this.locos.values());
  }
  abstract setTrackPower(on: boolean): Promise<boolean>;
  abstract emergencyStop(): Promise<boolean>;

  abstract getSensor(address: number): Promise<SensorInfo | null>;

  getPowerInfo(): PowerInfo {
    return this.powerInfo;
  }

  getLocoInfo(address: number): LocoState | undefined {
    return this.locos.get(address);
  }

  getTurnoutInfo(address: number): TurnoutInfo | undefined {
    return this.turnouts.get(address);
  }

  getName(): string {
    return this.name;
  }

  protected getOrCreateTurnout(address: number): TurnoutInfo {
    let turnout = this.turnouts.get(address);
    if (!turnout) {
      turnout = {
        address,
        closed: false,
      };
      this.turnouts.set(address, turnout);
    }
    return turnout;
  }

  protected getOrCreateAccessory(address: number): AccessoryInfo {
    let accessory = this.accessories.get(address);
    if (!accessory) {
      accessory = {
        address,
        active: false,
      };
      this.accessories.set(address, accessory);
    }
    return accessory;
  }

  // 
  abstract setBasicAccessory(address: number, active: boolean): Promise<boolean>;

  getAccessories(): AccessoryInfo[] {
    return Array.from(this.accessories.values());
  }

  getTurnouts(): TurnoutInfo[] {
    return Array.from(this.turnouts.values());
  }

  // Ha csatlakozott a commandcenter a 
  // locos layout belvasása és lekérni az állapotokat
  async init() {
    log("========================================");
    log("COMMANDCENTER INIT");
    log("========================================");

    const locos = await readLocos();
    if (locos) {
      for (const loco of locos) {
        log("getLoco:", loco.address);
        this.getLoco(loco.address);
      }
    }

  }

  //abstract getSystemState(): any;



}
