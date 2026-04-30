
import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { AddressedElement} from "../core/AddressedElement";
import { BaseElement } from "../core/BaseElement";
import { LayerId } from "../core/Layer";
import { sampleLayout } from "../sample/sampleLayout";
import { ELEMENT_TYPES, ElementType } from "../types/EditorTypes";
import { DrawOptions, ITrackCornerElement } from "../types/EditorTypes";

export class TrackCornerElement extends AddressedElement implements ITrackCornerElement {
    override type = ELEMENT_TYPES.TRACK_CORNER;
    

    constructor(x: number, y: number) {
        super(x, y);
        this.type = ELEMENT_TYPES.TRACK_CORNER;
        this.rotationStep = 90;
    }



    draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

        // ctx.translate(this.centerX, this.centerY);
        // ctx.rotate(this.rotation * Math.PI / 180);
        // ctx.translate(-this.centerX, -this.centerY);

        var w = this.GridSizeX / 4.0
        var h = this.GridSizeY / 4.0
        ctx.save()

        ctx.lineWidth = this.TrackWidth7;
        ctx.strokeStyle = this.TrackPrimaryColor

        if (this.rotation == 0) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.centerY);
            ctx.lineTo(this.PositionX + 1 * w, this.centerY);
            ctx.lineTo(this.centerX, this.centerY + 1 * h);
            ctx.lineTo(this.centerX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }
        else if (this.rotation == 90) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX, this.centerY);
            ctx.lineTo(this.PositionX + 1 * w, this.centerY);
            ctx.lineTo(this.centerX, this.centerY - 1 * h);
            ctx.lineTo(this.centerX, this.PositionY);
            ctx.stroke();
        }
        else if (this.rotation == 180) {
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.PositionY);
            ctx.lineTo(this.centerX, this.PositionY + h);
            ctx.lineTo(this.centerX + w, this.centerY);
            ctx.lineTo(this.PositionX + this.GridSizeX, this.centerY);
            ctx.stroke();
        }
        else if (this.rotation == 270) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX + this.GridSizeX, this.centerY);
            ctx.lineTo(this.centerX + w, this.centerY);
            ctx.lineTo(this.centerX, this.centerY + h);
            ctx.lineTo(this.centerX, this.PositionY + this.GridSizeY);
            ctx.stroke();
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = this.stateColor

        if (this.rotation == 0) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX + 1 * w, this.centerY);
            ctx.lineTo(this.centerX, this.centerY + 1 * h);
            ctx.stroke();
        }
        else if (this.rotation == 90) {
            ctx.beginPath();
            ctx.moveTo(this.PositionX + 1 * w, this.centerY);
            ctx.lineTo(this.centerX, this.centerY - 1 * h);
            ctx.stroke();
        }
        else if (this.rotation == 180) {
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.PositionY + h);
            ctx.lineTo(this.centerX + w, this.centerY);
            ctx.stroke();
        }
        else if (this.rotation == 270) {
            ctx.beginPath();
            ctx.moveTo(this.centerX + w, this.centerY);
            ctx.lineTo(this.centerX, this.centerY + h);
            ctx.stroke();
        }

        if (options?.showOccupancySensorAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString())
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

    hitTest(px: number, py: number): boolean {
        //const b = this.getBounds();
        //return px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height;
        return this.x == px && this.y == py;
    }

    override toJSON(): ITrackCornerElement {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_CORNER,
        };
    }

    override clone(): TrackCornerElement {
        const copy = new TrackCornerElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        return copy;
    }

}