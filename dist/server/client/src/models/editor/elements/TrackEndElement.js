import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { AddressedElement } from "../core/AddressedElement";
import { ELEMENT_TYPES } from "../types/EditorTypes";
export class TrackEndElement extends AddressedElement {
    type = ELEMENT_TYPES.TRACK_END;
    constructor(x, y) {
        super(x, y);
        this.rotationStep = 45;
    }
    draw(ctx, options) {
        if (!this.visible)
            return;
        this.beginDraw(ctx, options);
        {
            var h = this.GridSizeY / 4.0;
            ctx.translate(this.centerX, this.centerY);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.translate(-this.centerX, -this.centerY);
            ctx.lineWidth = this.TrackWidth7;
            ctx.strokeStyle = this.TrackPrimaryColor;
            if (this.rotation % 90 == 0) {
                ctx.beginPath();
                ctx.moveTo(this.PositionX, this.centerY);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.moveTo(this.centerX, this.centerY - h);
                ctx.lineTo(this.centerX, this.centerY + h);
                ctx.stroke();
            }
            else {
                var r = this.GridSizeX / 2;
                var l = Math.sqrt(2 * r * r);
                ctx.beginPath();
                ctx.moveTo(this.centerX - l, this.centerY);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.moveTo(this.centerX, this.centerY - h);
                ctx.lineTo(this.centerX, this.centerY + h);
                ctx.stroke();
            }
            ctx.lineWidth = this.TrackWidth3;
            // var color = Colors.TrackLightColor
            // switch(this.state) {
            //     case RailStates.selected : color = Colors.TrackSelectedColor
            //     break;
            //     case RailStates.occupied: color = Colors.TrackDangerColor
            //     break;
            // }
            ctx.strokeStyle = this.stateColor;
            const p = this.GridSizeX / 4;
            if (this.rotation % 90 == 0) {
                ctx.beginPath();
                ctx.moveTo(this.PositionX + p, this.centerY);
                ctx.lineTo(this.centerX - this.TrackWidth7 / 2, this.centerY);
                ctx.stroke();
            }
            else {
                var r = this.GridSizeX / 2;
                var l = Math.sqrt(2 * r * r) - p;
                ctx.beginPath();
                ctx.moveTo(this.centerX - l, this.centerY);
                ctx.lineTo(this.centerX - this.TrackWidth7 / 2, this.centerY);
                ctx.stroke();
            }
        }
        // drawPolarLine(ctx, this.centerX, this.centerY, settings.GridSizeX / 4, this.angle , color, settings.TrackWidth3)
        // // ctx.beginPath();
        this.endDraw(ctx);
        this.beginDraw(ctx);
        if (options?.showOccupancySensorAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString());
        }
        this.endDraw(ctx);
        super.drawSelection(ctx);
        //super.draw(ctx)
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
            type: ELEMENT_TYPES.TRACK_END
            // type: "trackend",
            // trackType: this.trackType,
            // length: this.length,
        };
    }
    clone() {
        const copy = new TrackEndElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        return copy;
    }
}
