import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { BaseElement } from "../core/BaseElement";
import { Layer } from "../core/Layer";
import { DrawOptions, ELEMENT_TYPES, IBaseElement, ITrackSignalElement } from "../types/EditorTypes";
import { IEditableProperty } from "./PropertyDescriptor";

export enum SignalStates {
    green,
    red,
    yellow,
    white
}

class SignalLight {
    value: number;
    color: string;
    constructor(value: number, color: string) {
        this.value = value
        this.color = color
    }
}
export class TrackSignalElement extends BaseElement implements ITrackSignalElement {
    override type: typeof ELEMENT_TYPES.TRACK_SIGNAL2 = ELEMENT_TYPES.TRACK_SIGNAL2;
    //outputMode: OutputModes = OutputModes.accessory;

    address: number = 0;
    addressLength: number = 5; // Digitools signal decoder must be 5 address
    max: number = 1

    isExtendedDecoder: boolean = false;

    lights: SignalLight[] = [
        { value: 0, color: "lime" },
        { value: 0, color: "red" },
        { value: 0, color: "yellow" },
        { value: 0, color: "white" },
    ]
    lightsAll: boolean = false;
    showAddress: boolean = false;
    dispalyAsSingleLamp: boolean = false;
    // showTrackElem: boolean = true;

    constructor(x: number, y: number) {
        super(x, y)
        this.address = 0;
        this.rotation = 90;
        this.rotationStep = 45;
        this.layerName = "sensors";
    }

    get lastAddress(): number {
        return this.address + this.addressLength
    }

    private _aspect: number = 2;
    public get aspect(): number {
        return this._aspect;
    }
    public set aspect(v: number) {
        if (v < 0) {
            v = 1
        } else if (v > this.lights.length) {
            v = this.lights.length
        }
        this._aspect = v;
    }


    private _value: number = 0;
    public get value(): number {
        return this._value;
    }
    public set value(v: number) {
        this._value = v;
    }

    mouseDown(e: MouseEvent) {
        var i = this.lights.findIndex((l) => {
            return l.value == this.value;
        })

        i++
        if (i >= this.max) {
            i = 0
        }
        this.send(this.lights[i]!.value)
    }

    sendGreen() {
        this.send(this.valueGreen)
    }
    sendRed() {
        this.send(this.valueRed)
    }
    sendYellow() {
        this.send(this.valueYellow)
    }
    sendWhite() {
        this.send(this.valueWhite)
    }

    setValue(address: number, v: boolean) {
        if (address >= this.address && address <= (this.lastAddress - 1)) {

            var i = address - this.address
            var mask = (1 << i)
            if (v) {
                this.value = (this.value | mask) & 0b0001_1111
            } else {
                this.value = (this.value & (~mask)) & 0b0001_1111
            }

            switch (this.value) {
                case this.valueGreen:
                    this.state = SignalStates.green
                    break;
                case this.valueYellow:
                    if (this.max > 2) {
                        this.state = SignalStates.yellow
                    } else {
                        this.state = SignalStates.red
                    }
                    break;
                case this.valueWhite:
                    if (this.max > 3) {
                        this.state = SignalStates.white
                    } else {
                        this.state = SignalStates.red
                    }
                    break;
                default: this.state = SignalStates.red
            }

            console.log("SIGNAL:", this.name, address, v, this.value)

        }
    }

    get isGreen(): boolean {
        return this.state == SignalStates.green
    }
    get isRed(): boolean {
        return this.state == SignalStates.red
    }
    get isYellow(): boolean {
        return this.state == SignalStates.yellow
    }
    get isWhite(): boolean {
        return this.state == SignalStates.white
    }

    // Api functions
    setGreen(): void {
        this.state = SignalStates.green
    }

    setRed(): void {
        this.state = SignalStates.red
    }
    setYellow(): void {
        this.state = SignalStates.yellow
    }
    setWhite(): void {
        this.state = SignalStates.white
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

    public get canRotate(): boolean {
        return true
    }
    public get hasProperties(): boolean {
        return true
    }

    public get valueGreen(): number {
        return this.lights[0]!.value;
    }
    public set valueGreen(v: number) {
        this.lights[0]!.value = v;
    }
    public get valueRed(): number {
        return this.lights[1]!.value;
    }
    public set valueRed(v: number) {
        this.lights[1]!.value = v;
    }
    public get valueYellow(): number {
        return this.lights[2]!.value;
    }
    public set valueYellow(v: number) {
        this.lights[2]!.value = v;
    }
    public get valueWhite(): number {
        return this.lights[3]!.value;
    }
    public set valueWhite(v: number) {
        this.lights[3]!.value = v;
    }

    drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    draw(ctx: CanvasRenderingContext2D, options: DrawOptions): void {

        this.drawSignal(ctx)

//        drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString())
        if (options.showSignalAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString())
        }

        this.beginDraw(ctx)

        this.endDraw(ctx);

        //this.drawAddress(ctx)
        //super.draw(ctx)
        super.drawSelection(ctx);

    }
    public drawSignal(ctx: CanvasRenderingContext2D) {

        this.beginDraw(ctx);

        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.translate(-this.centerX, -this.centerY);

        var x = this.posLeft + 6;
        var y = this.centerY - 12;
        var r = this.width / 13
        var d = 2 * r
        var h = d + 4
        var aa = this.aspect;
        if (this.dispalyAsSingleLamp) {
            aa = 1;
        }


        var a = aa < 2 ? 2 : aa


        ctx.beginPath()
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.roundRect(x - 4, y - r - 2, a * d + 5, 2 * r + 4, h)
        //ctx.roundRect(300, 5, 200, 100, [50, 0, 25, 0]);
        ctx.fill();
        ctx.stroke()

        ctx.beginPath()
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.fillStyle = "black";
        ctx.roundRect(x - 3, y - r - 1, a * d + 3, 2 * r + 2, h)

        ctx.fillRect(x, y - r / 2, this.width - 10, r)

        ctx.fillRect(this.posRight - 4, y - r / 2 - 3, 2, r + 6)

        //ctx.fillRect(this.posLeft + this.width - 6, y - r / 2 - 4, 2, 11)
        ctx.fill();
        ctx.stroke()

        x += aa == 1 ? 3 : 1
        if (aa == 1) {
            this.drawCircle(ctx,
                x, y,
                r,
                this.lights[this.state]!.color)
        } else {
            for (var i = 0; i < aa; i++) {

                if (this.lightsAll) {
                    this.drawCircle(ctx,
                        x + i * d, y,
                        r,
                        this.lights[i]!.color)
                } else {
                    this.drawCircle(ctx,
                        x + i * d, y,
                        r,
                        i == this.state ? this.lights[this.state]!.color : 'gray')
                }
            }
        }
        this.endDraw(ctx);
    }

    drawAddress(ctx: CanvasRenderingContext2D) {
        // if (this.showAddress) {
        //     var addr = "#" + this.address
        //     drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, addr)
        // }
    }

    private _state: SignalStates = SignalStates.red;
    public get state(): SignalStates {
        return this._state;
    }
    public set state(v: SignalStates) {
        this._state = v;
    }

    send(bits: number) {

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

    override toJSON(): ITrackSignalElement {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_SIGNAL2,
            aspect: this.aspect,
            dispalyAsSingleLamp: this.dispalyAsSingleLamp,
            valueGreen: this.valueGreen,
            valueRed: this.valueRed,
            valueYellow: this.valueYellow,
            valueWhite: this.valueWhite,
        };
    }

    override clone(): TrackSignalElement {
        const copy = new TrackSignalElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.aspect = this.aspect;
        copy.dispalyAsSingleLamp = this.dispalyAsSingleLamp;
        copy.valueGreen = this.valueGreen;
        copy.valueRed = this.valueRed;
        copy.valueYellow = this.valueYellow;
        copy.valueWhite = this.valueWhite;
        return copy;
    }

    override getEditableProperties(): IEditableProperty[] {
        return [
            // { label: "Név", key: "name", type: "string" },
            // { label: "Forgatás", key: "rotation", type: "number" },
            ...super.getEditableProperties(),
            { label: "Single", key: "dispalyAsSingleLamp", type: "checkbox", readonly: false },
            { label: "Singnal", key: "aspect", type: "signal2", readonly: true },
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
