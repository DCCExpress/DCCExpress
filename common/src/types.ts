export type Direction = "forward" | "reverse";

export type SetLocoMessage = {
  type: "setLoco";
  data: {
    address: number;
    speed: number;
    direction: Direction;
  };
};

export type SetLocoFunctionMessage = {
  type: "setLocoFunction";
  data: {
    fn: number;
    on: boolean;
  };
};


export type SetTurnoutMessage = {
  type: "setTurnout";
  data: {
    address: number;
    closed: boolean;
  };
  uuid: string;
};

export type TurnoutChangedMessage = {
  type: "turnoutChanged";
  data: {
    address: number;
    closed: boolean;
  };
};


export type AccessoryChangedMessage = {
  type: "accessoryChanged";
  data: {
    address: number;
    active: boolean;
  };
};

export type SetSensorMessage = {
  type: "setSensor";
  data: {
    address: number;
    on: boolean;
  };
  uuid: string;
};

export type CommandCenterInfo = {
  type: "commandCenterInfo";
  data: {
    type: string;
    alive: boolean;
    power: boolean;
  }
}
export type WsMessage =
  // | SetTurnoutMessage
  // | SetSensorMessage
  // | TurnoutChangedMessage
  // | CommandCenterInfo
  //| 
  {
      type: string;
      data: any;
      uuid: string | null;
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
  length: number;
  functions: LocoFunction[];
};


export type LocoState = {
  address: number;
  speed: number;
  direction: Direction;
  //functions: number;
  functions: Record<number, boolean>;
};

export type CommandCenterType = "z21" | "dcc-ex-tcp" | "dcc-ex-serial" | "simulator";

export interface ICommandCenter {
  name: string;
  type: CommandCenterType;
  z21: { host?: string; port?: number; }
  dccexTcp: { host?: string; port?: number; }
  dccexSerial: { serialPort?: string; baudRate?: number; }
  autoConnect?: boolean;
  //notes?: string;
}

