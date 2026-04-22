import { generateId } from "../../../helpers";
import { BaseElement } from "../core/BaseElement";
import { DrawOptions, ELEMENT_TYPES, IButtonElement, ITrackSensorElement } from "../types/EditorTypes";
import { IEditableProperty } from "./PropertyDescriptor";


export class ButtonElement extends BaseElement implements IButtonElement {
    override type = ELEMENT_TYPES.BUTTON;
    address: number = 0;
    on: boolean = true;
    colorOn: string = "lime";
    colorOff: string = "green";
    textOn: string = "ON";
    textOff: string = "OFF";

    draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

         var w = this.GridSizeX - 10

        ctx.fillStyle = this.on ? this.colorOn : "gray"
        ctx.strokeStyle = "black";


        ctx.beginPath();
        ctx.roundRect(this.centerX - w / 2, this.centerY - w / 2, w, w, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.fillStyle = this.on ? "black" : "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.on ? this.textOn : this.textOff, this.centerX, this.centerY + 1);
        this.endDraw(ctx);
        super.drawSelection(ctx)

    }

    override toJSON(): IButtonElement {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.BUTTON,
            address: this.address,
            colorOn: this.colorOn,
            colorOff: this.colorOff,
            textOn: this.textOn,
            textOff: this.textOff,
        };
    }

    override clone(): ButtonElement {
        const copy = new ButtonElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.address = this.address;
        copy.colorOn = this.colorOn;
        copy.colorOff = this.colorOff;
        copy.textOn = this.textOn;
        copy.textOff = this.textOff;
        return copy;
    }

    override getEditableProperties(): IEditableProperty[] {
        return [
            // { label: "Név", key: "name", type: "string" },
            // { label: "Forgatás", key: "rotation", type: "number" },
            ...super.getEditableProperties(),
            { label: "Szín", key: "colorOn", type: "colorpicker", readonly: false },
        ];
    }

}