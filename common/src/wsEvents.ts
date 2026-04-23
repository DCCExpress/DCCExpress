export interface WsEvents {
  sensorChanged: {
    address: number;
    on: boolean;
  };

  turnoutChanged: {
    address: number;
    closed: boolean;
  };

  commandCenterInfo: {
    alive: boolean;
  };
}