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

type PendingRequest = {
  resolve: (message: UdpMessage) => void;
  reject: (error: Error) => void;
  predicate: (message: UdpMessage) => boolean;
  timer: NodeJS.Timeout;
};

export class UdpClient extends EventEmitter {
  private readonly host: string;
  private readonly port: number;
  private readonly localPort?: number | undefined;
  private readonly timeoutMs: number;
  private readonly debug: boolean;

  private socket: Socket | undefined;
  private connected = false;
  private pendingRequests: PendingRequest[] = [];

  constructor(options: UdpClientOptions) {
    super();

    this.host = options.host;
    this.port = options.port;
    this.localPort = options.localPort;
    this.timeoutMs = options.timeoutMs ?? 1500;
    this.debug = options.debug ?? false;
  }

  get isOpen(): boolean {
    return this.connected;
  }

  async open(): Promise<void> {
    log("=======================================");
    log("              UDP OPEN");
    log("=======================================");

    if (this.connected) return;

    this.socket = dgram.createSocket("udp4");

    this.socket.on("listening", () => {
      console.log("UDP Client Listening!");
      this.emit("listening");
    });

    this.socket.on("message", (data, remote) => {
      const message: UdpMessage = { data, remote };

      if (this.debug) {
        console.log(
          `[UDP] <= ${remote.address}:${remote.port} ${bufferToHex(data)}`
        );
      }

      this.handleIncomingMessage(message);
      this.emit("message", message);
    });

    this.socket.on("error", (error) => {
      this.emit("error", error);

      if (this.debug) {
        console.error("[UDP] socket error:", error);
      }
    });

    this.socket.on("close", () => {
      this.connected = false;
      this.rejectAllPending(new Error("UDP socket closed"));
      this.emit("close");

      if (this.debug) {
        console.log("[UDP] socket closed");
      }
    });

    await new Promise<void>((resolve, reject) => {
      const socket = this.socket;
      if (!socket) {
        reject(new Error("UDP socket was not created"));
        return;
      }

      const onError = (error: Error) => {
        socket.off("listening", onListening);
        reject(error);
      };

      const onListening = () => {
        socket.off("error", onError);
        this.connected = true;

        if (this.debug) {
          const address = socket.address();
          console.log("[UDP] listening:", address);
        }

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
  }

  close(): void {
    if (!this.socket) return;

    this.rejectAllPending(new Error("UDP client closed"));

    this.socket.close();
    this.socket = undefined;
    this.connected = false;
  }

  async send(data: Buffer | Uint8Array | number[]): Promise<void> {
    await this.ensureOpen();

    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    if (this.debug) {
      console.log(`[UDP] => ${this.host}:${this.port} ${bufferToHex(buffer)}`);
    }

    await new Promise<void>((resolve, reject) => {
      const socket = this.socket;
      if (!socket) {
        reject(new Error("UDP socket is not open"));
        return;
      }

      socket.send(buffer, this.port, this.host, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  async sendAndReceive(
    data: Buffer | Uint8Array | number[],
    predicate?: (message: UdpMessage) => boolean,
    timeoutMs = this.timeoutMs
  ): Promise<UdpMessage> {
    await this.ensureOpen();

    const responsePromise = this.waitForMessage(
      predicate ?? (() => true),
      timeoutMs
    );

    await this.send(data);

    return responsePromise;
  }

  waitForMessage(
    predicate: (message: UdpMessage) => boolean,
    timeoutMs = this.timeoutMs
  ): Promise<UdpMessage> {
    return new Promise<UdpMessage>((resolve, reject) => {
      const request: PendingRequest = {
        resolve,
        reject,
        predicate,
        timer: setTimeout(() => {
          this.removePending(request);
          reject(new Error(`UDP response timeout after ${timeoutMs} ms`));
        }, timeoutMs),
      };

      this.pendingRequests.push(request);
    });
  }

  private handleIncomingMessage(message: UdpMessage): void {
    const request = this.pendingRequests.find((pending) => {
      try {
        return pending.predicate(message);
      } catch {
        return false;
      }
    });

    if (!request) return;

    this.removePending(request);
    request.resolve(message);
  }

  private removePending(request: PendingRequest): void {
    clearTimeout(request.timer);

    this.pendingRequests = this.pendingRequests.filter(
      (pending) => pending !== request
    );
  }

  private rejectAllPending(error: Error): void {
    for (const request of this.pendingRequests) {
      clearTimeout(request.timer);
      request.reject(error);
    }

    this.pendingRequests = [];
  }

  private async ensureOpen(): Promise<void> {
    if (this.connected) return;
    await this.open();
  }
}

export function bufferToHex(buffer: Buffer): string {
  return [...buffer]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join(" ");
}