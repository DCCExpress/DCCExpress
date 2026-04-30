import dgram from "dgram";
import { log, logError } from "../utility.js";
import { Buffer } from 'node:buffer';

export class UDPClient {
    name: string = "udp client"
    ip: string = ""
    port: number = 21105
    client: dgram.Socket;
    onmessage?: (payload: Buffer, rinfo: dgram.RemoteInfo) => void;
    onerror?: (error: Error) => void;

    constructor(name: string, ip: string, port: number, callback: (buffer: Buffer, rinfo: dgram.RemoteInfo) => void) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.client = dgram.createSocket('udp4')
        //this.client.bind(21105)
        this.client.on("listening", () => {
            log(`UDPClient listening: ${this.client.address().address}:${this.client.address().port}`);
            log('Receive Buffer Size:', this.client.getRecvBufferSize());
            log('Send Buffer Size:', this.client.getSendBufferSize());
        });

        this.client.on("message", (data: Buffer, rinfo: dgram.RemoteInfo) => {
            if (callback) {
                callback(data, rinfo)
            }
        })
    }

    send(data: Buffer, callback: (error: Error | null, bytes: number) => void) {
        this.client.send(data, this.port, this.ip, (error: Error | null, bytes: number) => {
            callback(error, bytes)
            
        })
    }
}