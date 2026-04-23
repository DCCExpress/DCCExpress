import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { wsApi } from "../../../services/wsApi";
import { ClickableBaseElement } from "../core/ClickableBaseElement";
import { ELEMENT_TYPES } from "../types/EditorTypes";
export class TrackTurnoutRightElement extends ClickableBaseElement {
    type = ELEMENT_TYPES.TRACK_TURNOUT_RIGHT;
    turnoutLocked = "yellow";
    turnoutUnLocked = "red";
    turnouAddress = 0;
    turnoutClosedValue = false;
    turnoutClosed = false;
    constructor(x, y) {
        super(x, y);
        this.rotationStep = 45;
    }
    draw(ctx, options) {
        if (!this.visible)
            return;
        this.beginDraw(ctx, options);
        this.drawTurnout(ctx, this.turnoutClosed);
        this.endDraw(ctx);
        this.beginDraw(ctx);
        if (options?.showTurnoutAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.turnouAddress.toString());
        }
        this.endDraw(ctx);
        super.drawSelection(ctx);
    }
    drawTurnout(ctx, t1Closed) {
        ctx.beginPath();
        ctx.strokeStyle = this.TrackPrimaryColor;
        ctx.lineWidth = this.TrackWidth7;
        if (this.rotation == 0) {
            ctx.moveTo(this.posLeft, this.centerY);
            ctx.lineTo(this.posRight, this.centerY);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.posRight, this.posBottom);
        }
        else if (this.rotation == 45) {
            ctx.moveTo(this.posLeft, this.posTop);
            ctx.lineTo(this.posRight, this.posBottom);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.centerX, this.posBottom);
        }
        else if (this.rotation == 90) {
            ctx.moveTo(this.centerX, this.posTop);
            ctx.lineTo(this.centerX, this.posBottom);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.posLeft, this.posBottom);
        }
        else if (this.rotation == 135) {
            ctx.moveTo(this.posRight, this.posTop);
            ctx.lineTo(this.posLeft, this.posBottom);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.posLeft, this.centerY);
        }
        else if (this.rotation == 180) {
            ctx.moveTo(this.posLeft, this.centerY);
            ctx.lineTo(this.posRight, this.centerY);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.posLeft, this.posTop);
        }
        else if (this.rotation == 225) {
            ctx.moveTo(this.posLeft, this.posTop);
            ctx.lineTo(this.posRight, this.posBottom);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.centerX, this.posTop);
        }
        else if (this.rotation == 270) {
            ctx.moveTo(this.centerX, this.posTop);
            ctx.lineTo(this.centerX, this.posBottom);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.posRight, this.posTop);
        }
        else if (this.rotation == 315) {
            ctx.moveTo(this.posRight, this.posTop);
            ctx.lineTo(this.posLeft, this.posBottom);
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.posRight, this.centerY);
        }
        ctx.stroke();
        // var color = this.TrackLightColor
        // switch (this.state) {
        //     case RailStates.selected: color = this.TrackSelectedColor
        //         break;
        //     case RailStates.occupied: color = this.TrackDangerColor
        //         break;
        // }
        // CLOSED
        if (t1Closed) {
            ctx.beginPath();
            ctx.strokeStyle = this.stateColor;
            ctx.lineWidth = this.TrackWidth3;
            var dx = this.width / 5;
            if (this.rotation == 0) {
                ctx.moveTo(this.posLeft + dx, this.centerY);
                ctx.lineTo(this.posRight - dx, this.centerY);
            }
            else if (this.rotation == 45) {
                ctx.moveTo(this.posLeft + dx, this.posTop + dx);
                ctx.lineTo(this.posRight - dx, this.posBottom - dx);
            }
            else if (this.rotation == 90) {
                ctx.moveTo(this.centerX, this.posTop + dx);
                ctx.lineTo(this.centerX, this.posBottom - dx);
            }
            else if (this.rotation == 135) {
                ctx.moveTo(this.posRight - dx, this.posTop + dx);
                ctx.lineTo(this.posLeft + dx, this.posBottom - dx);
            }
            else if (this.rotation == 180) {
                ctx.moveTo(this.posLeft + dx, this.centerY);
                ctx.lineTo(this.posRight - dx, this.centerY);
            }
            else if (this.rotation == 225) {
                ctx.moveTo(this.posLeft + dx, this.posTop + dx);
                ctx.lineTo(this.posRight - dx, this.posBottom - dx);
            }
            else if (this.rotation == 270) {
                ctx.moveTo(this.centerX, this.posTop + dx);
                ctx.lineTo(this.centerX, this.posBottom - dx);
            }
            else if (this.rotation == 315) {
                ctx.moveTo(this.posRight - dx, this.posTop + dx);
                ctx.lineTo(this.posLeft + dx, this.posBottom - dx);
            }
            ctx.stroke();
        }
        else {
            ctx.beginPath();
            ctx.strokeStyle = this.stateColor;
            ctx.lineWidth = this.TrackWidth3;
            var dx = this.width / 5;
            var dx2 = this.width / 5;
            if (this.rotation == 0) {
                ctx.moveTo(this.posLeft + dx, this.centerY);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.lineTo(this.posRight - dx2, this.posBottom - dx2);
            }
            else if (this.rotation == 45) {
                ctx.moveTo(this.posLeft + dx, this.posTop + dx);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.lineTo(this.centerX, this.posBottom - dx2);
            }
            else if (this.rotation == 90) {
                ctx.moveTo(this.centerX, this.posTop + dx);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.lineTo(this.posLeft + dx2, this.posBottom - dx2);
            }
            else if (this.rotation == 135) {
                ctx.moveTo(this.posRight - dx2, this.posTop + dx2);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.lineTo(this.posLeft + dx, this.centerY);
            }
            else if (this.rotation == 180) {
                ctx.moveTo(this.posLeft + dx2, this.posTop + dx2);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.lineTo(this.posRight - dx, this.centerY);
            }
            else if (this.rotation == 225) {
                ctx.moveTo(this.centerX, this.posTop + dx);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.lineTo(this.posRight - dx2, this.posBottom - dx2);
            }
            else if (this.rotation == 270) {
                ctx.moveTo(this.posRight - dx2, this.posTop + dx2);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.lineTo(this.centerX, this.posBottom - dx);
            }
            else if (this.rotation == 315) {
                ctx.moveTo(this.posRight - dx, this.centerY);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.lineTo(this.posLeft + dx2, this.posBottom - dx2);
            }
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.fillStyle = this.locked ? this.turnoutLocked : this.turnoutUnLocked;
        ctx.arc(this.centerX, this.centerY, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
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
    mouseDown(ev) {
        const closed = this.turnoutClosed == this.turnoutClosedValue;
        const data = { address: this.turnouAddress, closed: !closed };
        wsApi.setTurnout(data);
    }
    mouseUp(ev) {
        //alert("UP")
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_TURNOUT_RIGHT,
            address: this.address,
            turnouAddress: this.turnouAddress,
            turnoutClosedValue: this.turnoutClosedValue
        };
    }
    clone() {
        const copy = new TrackTurnoutRightElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.turnouAddress = this.turnouAddress;
        copy.turnoutClosedValue = this.turnoutClosedValue;
        return copy;
    }
    getEditableProperties() {
        return [
            ...super.getEditableProperties(),
            { label: "Turnout Address", key: "turnouAddress", type: "number", readonly: false, validate: (v) => { return v > 10; } },
            { label: "Closed Value", key: "turnoutClosedValue", type: "bittoggle", readonly: false, validate: (v) => { return true; } },
        ];
    }
}
