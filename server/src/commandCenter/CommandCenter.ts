/**
 * Abstract CommandCenter Base Class
 * 
 * All command center implementations (Z21, DCC-EX TCP, DCC-EX Serial) must extend this class.
 * This class defines the interface for controlling model railway hardware.
 */

export interface PowerInfo {
  trackVoltageOn: boolean;
  emergencyStop: boolean;
  shortCircuit: boolean;
  current: number;
}

export interface TurnoutInfo {
  address: number;
  closed: boolean;
}

export interface LocoInfo {
  address: number;
  speed: number;
  direction: "forward" | "reverse";
  functions: { [fn: number]: boolean };
}

export interface SensorInfo {
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

  protected locos: Map<number, LocoInfo> = new Map();
  protected turnouts: Map<number, TurnoutInfo> = new Map();
  protected sensors: Map<number, SensorInfo> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  abstract getConnectionString(): string;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract clientConnected(): void;

  abstract setTurnout(address: number, closed: boolean): Promise<boolean>;
  abstract getTurnout(address: number): Promise<TurnoutInfo | null>;

  abstract setLoco(address: number, speed: number, direction: "forward" | "reverse"): Promise<boolean>;
  abstract setLocoFunction(address: number, fn: number, active: boolean): Promise<boolean>;
  abstract getLoco(address: number): Promise<LocoInfo | null>;

  abstract setTrackPower(on: boolean): Promise<boolean>;
  abstract emergencyStop(): Promise<boolean>;

  abstract getSensor(address: number): Promise<SensorInfo | null>;

  getPowerInfo(): PowerInfo {
    return this.powerInfo;
  }

  getLocoInfo(address: number): LocoInfo | undefined {
    return this.locos.get(address);
  }

  getTurnoutInfo(address: number): TurnoutInfo | undefined {
    return this.turnouts.get(address);
  }

  getName(): string {
    return this.name;
  }
}
