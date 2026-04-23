export type SetTurnoutMessage = {
  type: "setTurnout";
  data: {
    address: number;
    closed: boolean;
  };
};

export type SetSensorMessage = {
  type: "setSensor";
  data: {
    address: number;
    on: boolean;
  };
};

export type CommandCenterInfo = {
  type: "commandCenterInfo";
  data: {
    type: string;
    alive: boolean;
  }
}
export type WsMessage =
  | SetTurnoutMessage
  | SetSensorMessage
  | {
      type: string;
      data?: any;
    };

export type LocoFunction = {
  id: string;
  number: number;
  name: string;
  icon: string;
  momentary: boolean;
  active?: boolean;
};

export type Loco = {
  id: string;
  name: string;
  address: number;
  maxSpeed: number;
  invert: boolean;
  image?: string;
  functions: LocoFunction[];
};

export type CommandCenterType = "z21" | "dcc-ex-tcp" | "dcc-ex-serial";

export interface ICommandCenter {
  name: string;
  type: CommandCenterType;
  z21: { host?: string; port?: number; }
  dccexTcp: { host?: string; port?: number; }
  dccexSerial: { serialPort?: string; baudRate?: number; }
  autoConnect?: boolean;
  //notes?: string;
}
