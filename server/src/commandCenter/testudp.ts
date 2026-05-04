import dgram, { type RemoteInfo, type Socket } from "node:dgram";
import { EventEmitter } from "node:events";
import { log } from "../utility.js";

export type UdpClientOptions = {
  host: string;
  port: number;
  localPort?: number;
  timeoutMs?: number;
  debug?: boolean;
};

export type UdpMessage = {
  data: Buffer;
  remote: RemoteInfo;
};

// type PendingRequest = {
//   resolve: (message: UdpMessage) => void;
//   reject: (error: Error) => void;
//   predicate: (message: UdpMessage) => boolean;
//   timer: NodeJS.Timeout;
// };

export class UdpClient extends EventEmitter {
  private readonly host: string;
  private readonly port: number;
  private readonly localPort?: number | undefined;
  private readonly timeoutMs: number;
  private readonly debug: boolean;

  private socket: Socket | undefined;
  public lastReceivedMessage = Date.now();
  public pollingTask: NodeJS.Timeout | undefined;
  //  private pendingRequests: PendingRequest[] = [];

  constructor(options: UdpClientOptions) {
    super();

    this.host = options.host;
    this.port = options.port;
    this.localPort = options.localPort;
    this.timeoutMs = options.timeoutMs ?? 1500;
    this.debug = options.debug ?? false;
  }

  get isOpen(): boolean {
    return this.socket != undefined;
  }

async open(): Promise<void> {
  log("=======================================");
  log("              UDP OPEN");
  log("=======================================");

  if (this.socket) return;

  const socket = dgram.createSocket("udp4");
  this.socket = socket;

  socket.on("message", (data, remote) => {
    const message: UdpMessage = { data, remote };

    this.lastReceivedMessage = Date.now();

    if (this.debug) {
      console.log(
        `[UDP] <= ${remote.address}:${remote.port} ${bufferToHex(data)}`
      );
    }

    this.emit("message", message);
  });

  socket.on("error", (error) => {
    if (this.debug) {
      console.error("[UDP] socket error:", error);
    }

    this.emit("udpError", error);
  });

  socket.on("close", () => {
    if (this.debug) {
      console.log("[UDP] socket closed");
    }

    this.emit("close");
  });

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      socket.off("listening", onListening);
      reject(error);
    };

    const onListening = () => {
      socket.off("error", onError);
      resolve();
    };

    socket.once("error", onError);
    socket.once("listening", onListening);

    if (this.localPort !== undefined) {
      socket.bind(this.localPort);
    } else {
      socket.bind();
    }
  });

  this.pollingTask = setInterval(() => {
    const diff = Date.now() - this.lastReceivedMessage;

    if (diff > this.timeoutMs) {
      void this.LAN_SYSTEMSTATE_GETDATA();
      void this.LAN_SET_BROADCASTFLAGS();
    }
  }, 1000);

  await this.LAN_SET_BROADCASTFLAGS();
  await this.LAN_SYSTEMSTATE_GETDATA();
}
  close(): void {
    if (this.pollingTask) {
      clearInterval(this.pollingTask);
      this.pollingTask = undefined;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
    this.lastReceivedMessage = 0;
  }
  async send(data: Buffer | Uint8Array | number[]): Promise<void> {

    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    if (this.debug) {
      console.log(`[UDP] => ${this.host}:${this.port} ${bufferToHex(buffer)}`);
    }

    await new Promise<void>((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("UDP socket is not open"));
        return;
      }

      this.socket.send(buffer, this.port, this.host, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  public async LAN_GET_SERIAL_NUMBER(): Promise<void> {
    log("Z21 LAN_GET_SERIAL_NUMBER()");
    await this.send([0x04, 0x00, 0x10, 0x00]);
  }

  public async LAN_SYSTEMSTATE_GETDATA(): Promise<void> {
    log("Z21 LAN_SYSTEMSTATE_GETDATA()");
    await this.send([0x04, 0x00, 0x85, 0x00]);
  }

  public async LAN_SET_BROADCASTFLAGS(): Promise<void> {
    log("Z21 LAN_SET_BROADCASTFLAGS()");
    await this.send([
      0x08, 0x00,       // length = 8
      0x50, 0x00,       // LAN_SET_BROADCASTFLAGS
      0x03, 0x01, 0x00, 0x00 // flags = 0x00000103
    ]);
  }


}

export function bufferToHex(buffer: Buffer): string {
  return [...buffer]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join(" ");
}

const udpClient = new UdpClient({
  host: "192.168.1.70",
  port: 21105,
  timeoutMs: 1500,
  debug: true,
});


await udpClient.open();

