import dgram from "dgram";
import { log } from "../utility.js";
export class UDPClient {
    name = "udp client";
    ip = "";
    port = 21105;
    client;
    onmessage;
    onerror;
    constructor(name, ip, port, callback) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.client = dgram.createSocket('udp4');
        //this.client.bind(21105)
        this.client.on("listening", () => {
            log(`UDPClient listening: ${this.client.address().address}:${this.client.address().port}`);
            log('Receive Buffer Size:', this.client.getRecvBufferSize());
            log('Send Buffer Size:', this.client.getSendBufferSize());
        });
        this.client.on("message", (data, rinfo) => {
            if (callback) {
                callback(data, rinfo);
            }
        });
    }
    send(data, callback) {
        this.client.send(data, this.port, this.ip, (error, bytes) => {
            callback(error, bytes);
        });
    }
}
