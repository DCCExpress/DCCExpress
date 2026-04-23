import { showErrorMessage, showOkMessage } from "../helpers";
export class CommandCenter {
    name;
    type;
    z21;
    dccexTcp;
    dccexSerial;
    autoConnect;
    alive = false;
    constructor(data) {
        this.name = data?.name ?? "Z21";
        this.type = data?.type ?? "z21";
        this.z21 = {
            host: data?.z21?.host ?? "192.168.1.111",
            port: data?.z21?.port ?? 21105,
        };
        this.dccexTcp = {
            host: data?.dccexTcp?.host ?? "192.168.1.143",
            port: data?.dccexTcp?.port ?? 2560,
        };
        this.dccexSerial = {
            serialPort: data?.dccexSerial?.serialPort ?? "COM3",
            baudRate: data?.dccexSerial?.baudRate ?? 115200,
        };
        this.autoConnect = data?.autoConnect ?? false;
    }
    get infoText() {
        switch (this.type) {
            case "z21":
                return `${this.name} IP: ${this.z21.host} PORT: ${this.z21.port}`;
            case "dcc-ex-tcp":
                return `${this.name} IP: ${this.dccexTcp.host} PORT: ${this.dccexTcp.port}`;
            case "dcc-ex-serial":
                return `${this.name} PORT: ${this.dccexSerial.serialPort}`;
        }
        return "NA";
    }
    clone() {
        const cc = new CommandCenter();
        cc.name = this.name;
        cc.type = this.type;
        cc.z21 = { ...this.z21 };
        cc.dccexTcp = { ...this.dccexTcp };
        cc.dccexSerial = { ...this.dccexSerial };
        return cc;
    }
}
export async function loadCommandCenters() {
    const response = await fetch("/api/command-centers");
    if (!response.ok) {
        showErrorMessage("COMMAND CENTER", "Could not load command center!");
        throw new Error("Nem sikerült betölteni a parancsközpontokat.");
    }
    return (await response.json());
}
export async function saveCommandCenters(items) {
    const response = await fetch("/api/command-centers", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(items),
    });
    if (response.ok) {
        showOkMessage("OK", "Parancsközpont mentve!");
    }
    else {
        showErrorMessage("Error", "Nem sikerült elmenteni a parancsközpontokat.");
    }
}
