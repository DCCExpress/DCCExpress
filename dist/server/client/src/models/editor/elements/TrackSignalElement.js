import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { BaseElement } from "../core/BaseElement";
import { ELEMENT_TYPES } from "../types/EditorTypes";
export var SignalStates;
(function (SignalStates) {
    SignalStates[SignalStates["green"] = 0] = "green";
    SignalStates[SignalStates["red"] = 1] = "red";
    SignalStates[SignalStates["yellow"] = 2] = "yellow";
    SignalStates[SignalStates["white"] = 3] = "white";
})(SignalStates || (SignalStates = {}));
class SignalLight {
    value;
    color;
    constructor(value, color) {
        this.value = value;
        this.color = color;
    }
}
export class TrackSignalElement extends BaseElement {
    type = ELEMENT_TYPES.TRACK_SIGNAL2;
    //outputMode: OutputModes = OutputModes.accessory;
    address = 0;
    addressLength = 5; // Digitools signal decoder must be 5 address
    max = 1;
    isExtendedDecoder = false;
    lights = [
        { value: 0, color: "lime" },
        { value: 0, color: "red" },
        { value: 0, color: "yellow" },
        { value: 0, color: "white" },
    ];
    lightsAll = false;
    showAddress = false;
    dispalyAsSingleLamp = false;
    // showTrackElem: boolean = true;
    constructor(x, y) {
        super(x, y);
        this.address = 0;
        this.rotation = 90;
        this.rotationStep = 45;
        this.layerName = "sensors";
    }
    get lastAddress() {
        return this.address + this.addressLength;
    }
    _aspect = 2;
    get aspect() {
        return this._aspect;
    }
    set aspect(v) {
        if (v < 0) {
            v = 1;
        }
        else if (v > this.lights.length) {
            v = this.lights.length;
        }
        this._aspect = v;
    }
    _value = 0;
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
    }
    mouseDown(e) {
        var i = this.lights.findIndex((l) => {
            return l.value == this.value;
        });
        i++;
        if (i >= this.max) {
            i = 0;
        }
        this.send(this.lights[i].value);
    }
    sendGreen() {
        this.send(this.valueGreen);
    }
    sendRed() {
        this.send(this.valueRed);
    }
    sendYellow() {
        this.send(this.valueYellow);
    }
    sendWhite() {
        this.send(this.valueWhite);
    }
    setValue(address, v) {
        if (address >= this.address && address <= (this.lastAddress - 1)) {
            var i = address - this.address;
            var mask = (1 << i);
            if (v) {
                this.value = (this.value | mask) & 0b0001_1111;
            }
            else {
                this.value = (this.value & (~mask)) & 0b0001_1111;
            }
            switch (this.value) {
                case this.valueGreen:
                    this.state = SignalStates.green;
                    break;
                case this.valueYellow:
                    if (this.max > 2) {
                        this.state = SignalStates.yellow;
                    }
                    else {
                        this.state = SignalStates.red;
                    }
                    break;
                case this.valueWhite:
                    if (this.max > 3) {
                        this.state = SignalStates.white;
                    }
                    else {
                        this.state = SignalStates.red;
                    }
                    break;
                default: this.state = SignalStates.red;
            }
            console.log("SIGNAL:", this.name, address, v, this.value);
        }
    }
    get isGreen() {
        return this.state == SignalStates.green;
    }
    get isRed() {
        return this.state == SignalStates.red;
    }
    get isYellow() {
        return this.state == SignalStates.yellow;
    }
    get isWhite() {
        return this.state == SignalStates.white;
    }
    // Api functions
    setGreen() {
        this.state = SignalStates.green;
    }
    setRed() {
        this.state = SignalStates.red;
    }
    setYellow() {
        this.state = SignalStates.yellow;
    }
    setWhite() {
        this.state = SignalStates.white;
    }
    sendRedIfNotRed() {
        if (!this.isRed) {
            this.sendRed();
        }
    }
    sendGreenIfNotGreen() {
        if (!this.isGreen) {
            this.sendGreen();
        }
    }
    sendYellowIfNotYellow() {
        if (!this.isYellow) {
            this.sendYellow();
        }
    }
    sendWhiteIfNotWhite() {
        if (!this.isWhite) {
            this.sendWhite();
        }
    }
    get canRotate() {
        return true;
    }
    get hasProperties() {
        return true;
    }
    get valueGreen() {
        return this.lights[0].value;
    }
    set valueGreen(v) {
        this.lights[0].value = v;
    }
    get valueRed() {
        return this.lights[1].value;
    }
    set valueRed(v) {
        this.lights[1].value = v;
    }
    get valueYellow() {
        return this.lights[2].value;
    }
    set valueYellow(v) {
        this.lights[2].value = v;
    }
    get valueWhite() {
        return this.lights[3].value;
    }
    set valueWhite(v) {
        this.lights[3].value = v;
    }
    drawCircle(ctx, x, y, r, color) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
    draw(ctx, options) {
        this.drawSignal(ctx);
        //        drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString())
        if (options.showSignalAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString());
        }
        this.beginDraw(ctx);
        this.endDraw(ctx);
        //this.drawAddress(ctx)
        //super.draw(ctx)
        super.drawSelection(ctx);
    }
    drawSignal(ctx) {
        this.beginDraw(ctx);
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.translate(-this.centerX, -this.centerY);
        var x = this.posLeft + 6;
        var y = this.centerY - 12;
        var r = this.width / 13;
        var d = 2 * r;
        var h = d + 4;
        var aa = this.aspect;
        if (this.dispalyAsSingleLamp) {
            aa = 1;
        }
        var a = aa < 2 ? 2 : aa;
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.roundRect(x - 4, y - r - 2, a * d + 5, 2 * r + 4, h);
        //ctx.roundRect(300, 5, 200, 100, [50, 0, 25, 0]);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.fillStyle = "black";
        ctx.roundRect(x - 3, y - r - 1, a * d + 3, 2 * r + 2, h);
        ctx.fillRect(x, y - r / 2, this.width - 10, r);
        ctx.fillRect(this.posRight - 4, y - r / 2 - 3, 2, r + 6);
        //ctx.fillRect(this.posLeft + this.width - 6, y - r / 2 - 4, 2, 11)
        ctx.fill();
        ctx.stroke();
        x += aa == 1 ? 3 : 1;
        if (aa == 1) {
            this.drawCircle(ctx, x, y, r, this.lights[this.state].color);
        }
        else {
            for (var i = 0; i < aa; i++) {
                if (this.lightsAll) {
                    this.drawCircle(ctx, x + i * d, y, r, this.lights[i].color);
                }
                else {
                    this.drawCircle(ctx, x + i * d, y, r, i == this.state ? this.lights[this.state].color : 'gray');
                }
            }
        }
        this.endDraw(ctx);
    }
    drawAddress(ctx) {
        // if (this.showAddress) {
        //     var addr = "#" + this.address
        //     drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, addr)
        // }
    }
    _state = SignalStates.red;
    get state() {
        return this._state;
    }
    set state(v) {
        this._state = v;
    }
    send(bits) {
        var addr = this.address;
        var len = this.addressLength;
        for (var i = 0; i < len; i++) {
            const value = ((bits >> i) & 1) == 1;
            // if (this.outputMode == OutputModes.accessory) {
            //     var d: iSetBasicAccessory = { address: this.address + i, value: value }
            //     wsClient.send({ type: ApiCommands.setBasicAccessory, data: d } as iData);
            // } else {
            //     var d: iSetOutput = { address: this.address + i, value: value}
            //     wsClient.send({ type: ApiCommands.setOutput, data: d } as iData);
            // }
        }
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_SIGNAL2,
            aspect: this.aspect
        };
    }
    clone() {
        const copy = new TrackSignalElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.aspect = this.aspect;
        return copy;
    }
    getEditableProperties() {
        return [
            // { label: "Név", key: "name", type: "string" },
            // { label: "Forgatás", key: "rotation", type: "number" },
            ...super.getEditableProperties(),
            { label: "Single", key: "dispalyAsSingleLamp", type: "checkbox", readonly: false },
        ];
    }
}
// export class Signal2Element extends Signal1Element {
//     constructor(uuid: string, address: number, x1: number, y1: number, name: string) {
//         super(uuid, address, x1, y1, name)
//         this.aspect = 2
//         this.max = 2;
//     }
//     get type(): string {
//         return 'signal2'
//     }
// }
// export class Signal3Element extends Signal1Element {
//     constructor(uuid: string, address: number, x1: number, y1: number, name: string) {
//         super(uuid, address, x1, y1, name)
//         this.aspect = 3
//         this.max = 3;
//     }
//     get type(): string {
//         return 'signal3'
//     }
// }
// export class Signal4Element extends Signal1Element {
//     constructor(uuid: string, address: number, x1: number, y1: number, name: string) {
//         super(uuid, address, x1, y1, name)
//         this.aspect = 4
//         this.max = 4;
//     }
// }
