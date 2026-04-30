import dgram from "node:dgram";
import { EventEmitter } from "node:events";
export class UdpClient extends EventEmitter {
    host;
    port;
    localPort;
    timeoutMs;
    debug;
    socket;
    connected = false;
    pendingRequests = [];
    constructor(options) {
        super();
        this.host = options.host;
        this.port = options.port;
        this.localPort = options.localPort;
        this.timeoutMs = options.timeoutMs ?? 1500;
        this.debug = options.debug ?? false;
    }
    get isOpen() {
        return this.connected;
    }
    async open() {
        if (this.connected)
            return;
        this.socket = dgram.createSocket("udp4");
        this.socket.on("message", (data, remote) => {
            const message = { data, remote };
            if (this.debug) {
                console.log(`[UDP] <= ${remote.address}:${remote.port} ${bufferToHex(data)}`);
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
        await new Promise((resolve, reject) => {
            const socket = this.socket;
            if (!socket) {
                reject(new Error("UDP socket was not created"));
                return;
            }
            const onError = (error) => {
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
            }
            else {
                socket.bind();
            }
        });
    }
    close() {
        if (!this.socket)
            return;
        this.rejectAllPending(new Error("UDP client closed"));
        this.socket.close();
        this.socket = undefined;
        this.connected = false;
    }
    async send(data) {
        await this.ensureOpen();
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        if (this.debug) {
            console.log(`[UDP] => ${this.host}:${this.port} ${bufferToHex(buffer)}`);
        }
        await new Promise((resolve, reject) => {
            const socket = this.socket;
            if (!socket) {
                reject(new Error("UDP socket is not open"));
                return;
            }
            socket.send(buffer, this.port, this.host, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    async sendAndReceive(data, predicate, timeoutMs = this.timeoutMs) {
        await this.ensureOpen();
        const responsePromise = this.waitForMessage(predicate ?? (() => true), timeoutMs);
        await this.send(data);
        return responsePromise;
    }
    waitForMessage(predicate, timeoutMs = this.timeoutMs) {
        return new Promise((resolve, reject) => {
            const request = {
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
    handleIncomingMessage(message) {
        const request = this.pendingRequests.find((pending) => {
            try {
                return pending.predicate(message);
            }
            catch {
                return false;
            }
        });
        if (!request)
            return;
        this.removePending(request);
        request.resolve(message);
    }
    removePending(request) {
        clearTimeout(request.timer);
        this.pendingRequests = this.pendingRequests.filter((pending) => pending !== request);
    }
    rejectAllPending(error) {
        for (const request of this.pendingRequests) {
            clearTimeout(request.timer);
            request.reject(error);
        }
        this.pendingRequests = [];
    }
    async ensureOpen() {
        if (this.connected)
            return;
        await this.open();
    }
}
export function bufferToHex(buffer) {
    return [...buffer]
        .map((value) => value.toString(16).padStart(2, "0"))
        .join(" ");
}
