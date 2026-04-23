import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { AddressedElement } from "../core/AddressedElement";
import { ELEMENT_TYPES } from "../types/EditorTypes";
export class TrackTurnoutTwoWayElement extends AddressedElement {
    type = ELEMENT_TYPES.TRACK_TURNOUT_TWO_WAY;
    turnoutLocked = "yellow";
    turnoutUnLocked = "red";
    turnoutAddress = 0;
    constructor(x, y) {
        super(x, y);
        this.rotationStep = 45;
    }
    draw(ctx, options) {
        if (!this.visible)
            return;
        this.beginDraw(ctx, options);
        this.drawTurnout(ctx, false);
        this.endDraw(ctx);
        this.beginDraw(ctx);
        if (options?.showTurnoutAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.turnoutAddress.toString());
        }
        this.endDraw(ctx);
        super.drawSelection(ctx);
    }
    drawTurnout(ctx, t1Closed) {
        var dx = this.width / 5;
        ctx.beginPath();
        ctx.strokeStyle = this.TrackPrimaryColor;
        ctx.lineWidth = this.TrackWidth7;
        if (this.rotation % 90 == 0) {
            ctx.translate(this.centerX, this.centerY);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.translate(-this.centerX, -this.centerY);
            ctx.moveTo(this.posLeft, this.centerY);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.posRight, this.posTop);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.posRight, this.posBottom);
            ctx.stroke();
            // ==========
            ctx.beginPath();
            ctx.strokeStyle = this.stateColor;
            ctx.lineWidth = this.TrackWidth3;
            ctx.moveTo(this.posLeft + dx, this.centerY);
            ctx.lineTo(this.centerX, this.centerY);
            if (t1Closed) {
                ctx.lineTo(this.posRight - dx, this.posTop + dx);
            }
            else {
                ctx.moveTo(this.centerX, this.centerY);
                ctx.lineTo(this.posRight - dx, this.posBottom - dx);
            }
            ctx.stroke();
            // Triangle
            if (this.selected) {
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.moveTo(this.posRight - 3, this.centerY);
                ctx.lineTo(this.posRight - 6, this.centerY - 2);
                ctx.lineTo(this.posRight - 6, this.centerY + 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
        else { // 45
            ctx.translate(this.centerX, this.centerY);
            ctx.rotate((this.rotation + 45) * Math.PI / 180);
            ctx.translate(-this.centerX, -this.centerY);
            ctx.moveTo(this.posLeft, this.posBottom);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(this.centerX, this.posTop);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.posRight, this.centerY);
            ctx.stroke();
            //=================
            ctx.beginPath();
            ctx.strokeStyle = this.stateColor;
            ctx.lineWidth = this.TrackWidth3;
            ctx.moveTo(this.posLeft + dx, this.posBottom - dx);
            ctx.lineTo(this.centerX, this.centerY);
            if (t1Closed) {
                ctx.lineTo(this.centerX, this.posTop + dx);
            }
            else {
                ctx.moveTo(this.centerX, this.centerY);
                ctx.lineTo(this.posRight - dx, this.centerY);
            }
            ctx.stroke();
            // Triangle
            if (this.selected) {
                ctx.translate(this.centerX, this.centerY);
                ctx.rotate((-this.rotation) * Math.PI * 180);
                ctx.rotate((this.rotation - 45) * Math.PI * 180);
                ctx.translate(-this.centerX, -this.centerY);
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.moveTo(this.posRight - 3, this.centerY);
                ctx.lineTo(this.posRight - 6, this.centerY - 2);
                ctx.lineTo(this.posRight - 6, this.centerY + 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.fillStyle = this.locked ? this.turnoutLocked : this.turnoutUnLocked;
        ctx.arc(this.centerX, this.centerY, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_TURNOUT_TWO_WAY,
            address: this.address
        };
    }
    clone() {
        const copy = new TrackTurnoutTwoWayElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.address = this.address;
        return copy;
    }
}
