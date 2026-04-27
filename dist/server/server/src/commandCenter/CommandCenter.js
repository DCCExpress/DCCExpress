/**
 * Abstract CommandCenter Base Class
 *
 * All command center implementations (Z21, DCC-EX TCP, DCC-EX Serial) must extend this class.
 * This class defines the interface for controlling model railway hardware.
 */
export class CommandCenter {
    name;
    powerInfo = {
        trackVoltageOn: false,
        emergencyStop: false,
        shortCircuit: false,
        current: 0,
    };
    locos = new Map();
    turnouts = new Map();
    sensors = new Map();
    constructor(name) {
        this.name = name;
    }
    getOrCreateLoco(address) {
        let loco = this.locos.get(address);
        if (!loco) {
            loco = {
                address,
                speed: 0,
                direction: "forward",
                functions: {},
            };
            this.locos.set(address, loco);
        }
        return loco;
    }
    getLocos() {
        return Array.from(this.locos.values());
    }
    getPowerInfo() {
        return this.powerInfo;
    }
    getLocoInfo(address) {
        return this.locos.get(address);
    }
    getTurnoutInfo(address) {
        return this.turnouts.get(address);
    }
    getName() {
        return this.name;
    }
}
