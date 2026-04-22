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

  /**
   * Get human-readable connection string for debugging
   */
  abstract getConnectionString(): string;

  /**
   * Start the command center connection
   */
  abstract start(): Promise<void>;

  /**
   * Stop the command center connection
   */
  abstract stop(): Promise<void>;

  /**
   * Called when a client connects - request full state
   */
  abstract clientConnected(): void;

  /**
   * TURNOUT CONTROL
   */
  abstract setTurnout(address: number, closed: boolean): Promise<boolean>;
  abstract getTurnout(address: number): Promise<TurnoutInfo | null>;

  /**
   * LOCOMOTIVE CONTROL
   */
  abstract setLoco(address: number, speed: number, direction: "forward" | "reverse"): Promise<boolean>;
  abstract setLocoFunction(address: number, fn: number, active: boolean): Promise<boolean>;
  abstract getLoco(address: number): Promise<LocoInfo | null>;

  /**
   * POWER CONTROL
   */
  abstract setTrackPower(on: boolean): Promise<boolean>;
  abstract emergencyStop(): Promise<boolean>;

  /**
   * SENSOR / INPUT CONTROL
   */
  abstract getSensor(address: number): Promise<SensorInfo | null>;

  /**
   * Get current power state
   */
  getPowerInfo(): PowerInfo {
    return this.powerInfo;
  }

  /**
   * Get stored loco info
   */
  getLocoInfo(address: number): LocoInfo | undefined {
    return this.locos.get(address);
  }

  /**
   * Get stored turnout info
   */
  getTurnoutInfo(address: number): TurnoutInfo | undefined {
    return this.turnouts.get(address);
  }

  /**
   * Get name
   */
  getName(): string {
    return this.name;
  }
}
