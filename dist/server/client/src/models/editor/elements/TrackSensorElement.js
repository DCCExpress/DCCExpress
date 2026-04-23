import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { BaseElement } from "../core/BaseElement";
import { ELEMENT_TYPES } from "../types/EditorTypes";
export var SensorTypes;
(function (SensorTypes) {
    SensorTypes[SensorTypes["circle"] = 0] = "circle";
    SensorTypes[SensorTypes["rect"] = 1] = "rect";
})(SensorTypes || (SensorTypes = {}));
export class TrackSensorElement extends BaseElement {
    type = ELEMENT_TYPES.TRACK_SENSOR;
    address = 0;
    on = true;
    kind = SensorTypes.rect;
    colorOn = "lime";
    colorOff = "green";
    textOn = "ON";
    textOff = "OFF";
    constructor(x, y) {
        super(x, y);
        this.layerName = "sensors";
    }
    draw(ctx, options) {
        if (!this.visible)
            return;
        this.beginDraw(ctx, options);
        // console.log("SENSOR: ", this.on);
        ctx.fillStyle = this.on ? this.colorOn : "gray";
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
        if (options?.showSensorAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString());
        }
        this.endDraw(ctx);
        super.drawSelection(ctx);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_SENSOR,
            address: this.address,
            kind: this.kind,
            colorOn: this.colorOn,
            colorOff: this.colorOff,
            // textOn: this.textOn,
            // textOff: this.textOff,
        };
    }
    clone() {
        const copy = new TrackSensorElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.address = this.address;
        copy.kind = this.kind;
        copy.colorOn = this.colorOn;
        copy.colorOff = this.colorOff;
        copy.textOn = this.textOn;
        copy.textOff = this.textOff;
        return copy;
    }
    getEditableProperties() {
        return [
            ...super.getEditableProperties(),
            { label: "Sensor Address", key: "address", type: "number", readonly: false },
            // { label: "Text ON", key: "textOn", type: "string", readonly: false },
            // { label: "Text OFF", key: "textOff", type: "string", readonly: false },
            { label: "Color ON", key: "colorOn", type: "colorpicker", readonly: false },
        ];
    }
}
