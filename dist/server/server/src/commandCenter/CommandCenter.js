import { readLocos } from "../routes/locoRoutes.js";
import { log } from "../utility.js";
import { onLocosChanged } from "../services/locoChangeNotifier.js";
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
    accessories = new Map();
    rbusGroups = new Map();
    locked = false;
    lockOwnerUUID = "";
    constructor(name) {
        this.name = name;
        onLocosChanged(async () => {
            const llocos = await readLocos();
            this.setLocos(llocos);
        });
    }
    setLocos(llocos) {
        this.locos.clear();
        for (const loco of llocos) {
            this.locos.set(loco.address, {
                ...loco,
                speed: 0,
                direction: "forward",
                functions: {},
            });
        }
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
    getOrCreateTurnout(address) {
        let turnout = this.turnouts.get(address);
        if (!turnout) {
            turnout = {
                address,
                closed: false,
            };
            this.turnouts.set(address, turnout);
        }
        return turnout;
    }
    getOrCreateAccessory(address) {
        let accessory = this.accessories.get(address);
        if (!accessory) {
            accessory = {
                address: address,
                active: false,
            };
            this.accessories.set(address, accessory);
        }
        return accessory;
    }
    getAccessories() {
        return Array.from(this.accessories.values());
    }
    getTurnouts() {
        return Array.from(this.turnouts.values());
    }
    // Ha csatlakozott a commandcenter a 
    // locos layout belvasása és lekérni az állapotokat
    async init() {
        log("========================================");
        log("COMMANDCENTER INIT");
        log("========================================");
        const locos = await readLocos();
        if (locos) {
            for (const loco of locos) {
                log("getLoco:", loco.address);
                this.getLoco(loco.address);
            }
        }
    }
}
