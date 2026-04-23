import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { AddressedElement } from "../core/AddressedElement";
import { ELEMENT_TYPES } from "../types/EditorTypes";
export class TrackCurveElement extends AddressedElement {
    type = ELEMENT_TYPES.TRACK_CURVE;
    constructor(x, y) {
        super(x, y);
        this.type = ELEMENT_TYPES.TRACK_CURVE;
        this.rotationStep = 45;
    }
    draw(ctx, options) {
        if (!this.visible)
            return;
        this.beginDraw(ctx, options);
        var w = this.GridSizeX / 2.0;
        var h = this.GridSizeY / 2.0;
        ctx.save();
        ctx.lineWidth = this.TrackWidth7;
        ctx.strokeStyle = this.TrackPrimaryColor;
        if (this.rotation == 0) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.PositionY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.centerY);
            ctx.stroke();
        }
        else if (this.rotation == 45) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX + this.GridSizeX / 2, this.PositionY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }
        else if (this.rotation == 90) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX + this.GridSizeX, this.PositionY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.centerX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }
        else if (this.rotation == 135) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.PositionY + this.GridSizeY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.centerY);
            ctx.stroke();
        }
        else if (this.rotation == 180) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.centerY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }
        else if (this.rotation == 225) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.PositionY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.centerX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }
        else if (this.rotation == 270) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.PositionY + this.GridSizeY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.centerX, this.PositionY);
            ctx.stroke();
        }
        else if (this.rotation == 315) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.centerY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.PositionY);
            ctx.stroke();
        }
        ctx.lineWidth = this.TrackWidth3;
        ctx.strokeStyle = this.stateColor;
        var w2 = this.GridSizeX / 3;
        ctx.lineDashOffset = -w2 / 3; //w3 / 2.0
        ctx.setLineDash([w2, w2]);
        if (this.rotation == 0) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.PositionY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.centerY);
            ctx.stroke();
        }
        else if (this.rotation == 45) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX + this.GridSizeX / 2, this.PositionY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }
        else if (this.rotation == 90) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX + this.GridSizeX, this.PositionY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.centerX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }
        else if (this.rotation == 135) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.PositionY + this.GridSizeY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.centerY);
            ctx.stroke();
        }
        else if (this.rotation == 180) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.centerY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }
        else if (this.rotation == 225) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.PositionY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.centerX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }
        else if (this.rotation == 270) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.PositionY + this.GridSizeY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.centerX, this.PositionY);
            ctx.stroke();
        }
        else if (this.rotation == 315) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.centerY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.PositionY);
            ctx.stroke();
        }
        if (options?.showOccupancySensorAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString());
        }
        this.endDraw(ctx);
        super.drawSelection(ctx);
    }
    // getBounds(): Rect {
    //     return {
    //         x: this.x - this.GridSizeX,
    //         y: this.y - this.GridSizeX,
    //         width: this.GridSizeX,
    //         height: this.GridSizeX,
    //     };
    // }
    hitTest(px, py) {
        //const b = this.getBounds();
        //return px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height;
        return this.x == px && this.y == py;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_CURVE,
        };
    }
    clone() {
        const copy = new TrackCurveElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        return copy;
    }
}
