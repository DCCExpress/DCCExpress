/**
 * Abstract CommandCenter Base Class
 * 
 * All command center implementations (Z21, DCC-EX TCP, DCC-EX Serial) must extend this class.
 * This class defines the interface for controlling model railway hardware.
 */

import { Dir } from "node:fs";
import { Direction } from "../../../common/src/types.js";

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

  setBasicAccessory(address: number, active: boolean): Promise<boolean> {
    const accessory = this.getOrCreateAccessory(address);
    accessory.active = active;
    return Promise.resolve(true);
  }

  getAccessories(): AccessoryInfo[] {
    return Array.from(this.accessories.values());
  }
  




}
