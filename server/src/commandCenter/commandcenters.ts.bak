import { iSetBasicAccessory, iSetTurnout, iGetTurnout, iLoco, iSetLocoFunction, iSetPower, CommandCenterTypes, iZ21CommandCenter, iCommandCenter, iDCCExTcp, iDCCExSerial, iGetSensor, iSetOutput, iDccExDirectCommand, iData, ApiCommands, blocks } from "../../common/src/dcc";
import { CommandCenter } from "./CommandCenter.js";
import { COMMANDCENTER_SETTING_FILE } from "./server";
import * as fs from "fs";
import { Z21CommandCenter } from "./z21commandcenter.js";
// import { DCCExTCPCommandCenter } from "./dccExTCPCommandCenter";
// import { DccExSerialCommandCenter } from "./dccExSerialCommandCenter";
import { log, logError } from "../utility.js";

export class CommandCenters {

    cc?: CommandCenter = undefined;

    getSystemState() {
        if (this.cc) {
            this.cc.getSystemState()
        }
    }

    start() {
        log("Command Centers Start")
        if (this.cc) {
            this.cc.start()
            log(this.cc.name + "Command Center Started!")
        } else {
            log("Command Center doesn't exists!")
        }
    }

    stop() {
        log("Command Centers Stopping...")
        if (this.cc) {
            this.cc.stop()
            log("Command Centers Stopped")
        } else {
            log("Command Center doesn't exists!")
        }
    }

    clientConnected() {
        if (this.cc) {
            this.cc.clientConnected()
        } else {
            log("Command Center doesn't exists!")
        }
    }

    setBasicAccessory(a: iSetBasicAccessory) {
        if (this.cc) {
            this.cc.setAccessoryDecoder(a.address, a.value)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    getBasicAccessory(a: iSetBasicAccessory) {
        if (this.cc) {
            this.cc.getAccessoryDecoder(a.address)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    setOutput(a: iSetOutput) {
        if (this.cc) {
            this.cc.setOutput(a.address, a.value)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    getOutput(a: iSetBasicAccessory) {
        if (this.cc) {
            this.cc.getOutput(a.address)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    getTurnout(t: iGetTurnout) {
        if (this.cc) {
            this.cc.getTurnout(t.address)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    setTurnout(t: iSetTurnout) {
        if (this.cc) {
            this.cc.setTurnout(t.address, t.isClosed, t.outputMode)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    getRBusInfo() {
        if (this.cc) {
            this.cc.getRBusInfo()
        } else {
            log("Command Center doesn't exists!")
        }
    }

    getSensor(sensor: iGetSensor) {
        if (this.cc) {
            this.cc.getSensorInfo(sensor.address)
        } else {
            log("Command Center doesn't exists!")
        }
    }
    
    getLoco(loco: iLoco) {
        if (this.cc) {
            this.cc!.getLoco(loco.address)
        } else {
            log("Command Center doesn't exists!")
        }
    }
    setLoco(loco: iLoco) {
        if (this.cc) {
            this.cc!.setLoco(loco.address, loco.speed, loco.direction)
        } else {
            log("Command Center doesn't exists!")
        }
    }
    setLocoFunction(loco: iSetLocoFunction) {
        if (this.cc) {
            this.cc!.setLocoFunction(loco.address, loco.id, loco.isOn)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    setTrackPower(data: iSetPower) {
        if (this.cc) {
            this.cc!.setTrackPower(data.on)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    setProgPower(data: iSetPower) {
        if (this.cc) {
            this.cc!.setProgPower(data.on)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    emergencyStop() {
        if (this.cc) {
            this.cc!.emergenyStop(true)
        } else {
            log("Command Center doesn't exists!")
        }
    }

    writeDirectCommand(data: iDccExDirectCommand): void {
        if (this.cc) {
            this.cc!.writeDirectCommand(data.command)
        } else {
            log("Command Center doesn't exists!")
        }           
    }

    load() {
        log("CommandCenters.load()")
        if (this.cc) {
            this.cc.stop()
        }

        try {
            const ccSettings = JSON.parse(fs.readFileSync(COMMANDCENTER_SETTING_FILE, 'utf8')) as iCommandCenter;
            if (ccSettings.type == CommandCenterTypes.Z21) {
                const z21 = ccSettings.commandCenter as iZ21CommandCenter
                commandCenters.cc = new Z21CommandCenter("z21", z21.ip, z21.port, "")
                commandCenters.cc.TURNOUT_WAIT_TIME = z21.turnoutActiveTime
                commandCenters.cc.BASICACCESSORY_WAIT_TIME = z21.basicAccessoryDecoderActiveTime
                log("============================================================================")
                log("Z21 Command Center Registered!")
                log("IP:", z21.ip)
                log("Port:", z21.port)
                log("============================================================================")
                commandCenters.start()
            }
            else if (ccSettings.type == CommandCenterTypes.DCCExTCP) {
                const dccextcp = ccSettings.commandCenter as iDCCExTcp
                commandCenters.cc = new DCCExTCPCommandCenter("dcc-ex-tcp", dccextcp.ip, dccextcp.port, dccextcp.init)
                commandCenters.cc.TURNOUT_WAIT_TIME = 0 //dccextcp.turnoutActiveTime
                commandCenters.cc.BASICACCESSORY_WAIT_TIME = 0 //dccextcp.basicAccessoryDecoderActiveTime
                log("============================================================================")
                log("DCCEx TCP Command Center Registered!")
                log("IP:", dccextcp.ip)
                log("Port:", dccextcp.port)
                log("============================================================================")
                commandCenters.start()
            }
            else if (ccSettings.type == CommandCenterTypes.DCCExSerial) {
                const dccexserial = ccSettings.commandCenter as iDCCExSerial
                commandCenters.cc = new DccExSerialCommandCenter("dcc-ex-serial", dccexserial.port, 115200, dccexserial.init)
                commandCenters.cc.TURNOUT_WAIT_TIME = 0 //dccextcp.turnoutActiveTime
                commandCenters.cc.BASICACCESSORY_WAIT_TIME = 0 //dccextcp.basicAccessoryDecoderActiveTime
                log("============================================================================")
                log("DCCEx Serial Command Center Registered!")
                log("Port:", dccexserial.port)
                log("============================================================================")
                commandCenters.start()
            }

        } catch (error) {
            logError("ServerSetting Error:", error)
        }
    }
}

export const commandCenters = new CommandCenters()
