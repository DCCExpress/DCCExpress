import dgram from "node:dgram";
import { EventEmitter } from "node:events";
import { log } from "../utility.js";
// type PendingRequest = {
//   resolve: (message: UdpMessage) => void;
//   reject: (error: Error) => void;
//   predicate: (message: UdpMessage) => boolean;
//   timer: NodeJS.Timeout;
// };
export class UdpClient extends EventEmitter {
    host;
    port;
    localPort;
    timeoutMs;
    debug;
    socket;
    lastReceivedMessage = Date.now();
    //  private pendingRequests: PendingRequest[] = [];
    constructor(options) {
        super();
        this.host = options.host;
        this.port = options.port;
        this.localPort = options.localPort;
        this.timeoutMs = options.timeoutMs;
        this.debug = options.debug ?? false;
    }
    get isOpen() {
        return Date.now() - this.lastReceivedMessage <= this.timeoutMs;
    }
    async open() {
        log("=======================================");
        log("              UDP OPEN");
        log("=======================================");
        if (this.socket)
            return;
        const socket = dgram.createSocket("udp4");
        this.socket = socket;
        socket.on("message", (data, remote) => {
            const message = { data, remote };
            this.lastReceivedMessage = Date.now();
            if (this.debug) {
                console.log(`[UDP] <= ${remote.address}:${remote.port} ${bufferToHex(data)}`);
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
        await new Promise((resolve, reject) => {
            const onError = (error) => {
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
            }
            else {
                socket.bind();
            }
        });
    }
    close() {
        // if (this.pollingTask) {
        //   clearInterval(this.pollingTask);
        //   this.pollingTask = undefined;
        // }
        if (this.socket) {
            this.socket.close();
            this.socket = undefined;
        }
        this.lastReceivedMessage = 0;
    }
    async send(data) {
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        if (this.debug) {
            console.log(`[UDP] => ${this.host}:${this.port} ${bufferToHex(buffer)}`);
        }
        await new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error("UDP socket is not open"));
                return;
            }
            this.socket.send(buffer, this.port, this.host, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}
export function bufferToHex(buffer) {
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
