
import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { AddressedElement } from "../core/AddressedElement";
import { DrawOptions, ELEMENT_TYPES, ITrackCrossingElement } from "../types/EditorTypes";

export class TrackCrossingElement extends AddressedElement implements ITrackCrossingElement {

    override type = ELEMENT_TYPES.TRACK_CROSSING;
    constructor(x: number, y: number) {
        super(x, y);
        this.type = ELEMENT_TYPES.TRACK_CROSSING;
        this.rotationStep = 45;
    }



    draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

        {
            if (!this.enabled) {
                ctx.globalAlpha = this.alpha;
            }
            ctx.beginPath();
            ctx.strokeStyle = this.TrackPrimaryColor
            ctx.lineWidth = this.TrackWidth7;

            if (this.rotation == 0 || this.rotation == 180) {
                ctx.moveTo(this.posLeft, this.centerY)
                ctx.lineTo(this.posRight, this.centerY)
                ctx.moveTo(this.posLeft, this.posTop)
                ctx.lineTo(this.posRight, this.posBottom)
            }
            else if (this.rotation == 45 || this.rotation == 225) {
                ctx.moveTo(this.centerX, this.posTop)
                ctx.lineTo(this.centerX, this.posBottom)
                ctx.moveTo(this.posLeft, this.posTop)
                ctx.lineTo(this.posRight, this.posBottom)
            }
            else if (this.rotation == 90 || this.rotation == 270) {
                ctx.moveTo(this.centerX, this.posTop)
                ctx.lineTo(this.centerX, this.posBottom)
                ctx.moveTo(this.posRight, this.posTop)
                ctx.lineTo(this.posLeft, this.posBottom)
            }
            else if (this.rotation == 135 || this.rotation == 315) {
                ctx.moveTo(this.posLeft, this.centerY)
                ctx.lineTo(this.posRight, this.centerY)
                ctx.moveTo(this.posRight, this.posTop)
                ctx.lineTo(this.posLeft, this.posBottom)
            }
            ctx.stroke()
        }

        {
            ctx.beginPath();
            ctx.strokeStyle = this.stateColor
            ctx.lineWidth = this.TrackWidth3;

            var dx = this.width / 5

            if (this.rotation == 0 || this.rotation == 180) {
                ctx.moveTo(this.posLeft + dx, this.centerY)
                ctx.lineTo(this.posRight - dx, this.centerY)
                ctx.moveTo(this.posLeft + dx, this.posTop + dx)
                ctx.lineTo(this.posRight - dx, this.posBottom - dx)
            }
            else if (this.rotation == 45 || this.rotation == 225) {
                ctx.moveTo(this.centerX, this.posTop + dx)
                ctx.lineTo(this.centerX, this.posBottom - dx)
                ctx.moveTo(this.posLeft + dx, this.posTop + dx)
                ctx.lineTo(this.posRight - dx, this.posBottom - dx)
            }
            else if (this.rotation == 90 || this.rotation == 270) {
                ctx.moveTo(this.centerX, this.posTop + dx)
                ctx.lineTo(this.centerX, this.posBottom - dx)
                ctx.moveTo(this.posRight - dx, this.posTop + dx)
                ctx.lineTo(this.posLeft + dx, this.posBottom - dx)
            }
            else if (this.rotation == 135 || this.rotation == 315) {
                ctx.moveTo(this.posLeft + dx, this.centerY)
                ctx.lineTo(this.posRight - dx, this.centerY)
                ctx.moveTo(this.posRight - dx, this.posTop + dx)
                ctx.lineTo(this.posLeft + dx, this.posBottom - dx)
            }
            ctx.stroke()
        }

        if (options?.showOccupancySensorAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString())
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

    hitTest(px: number, py: number): boolean {
        //const b = this.getBounds();
        //return px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height;
        return this.x == px && this.y == py;
    }

    override toJSON(): ITrackCrossingElement {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_CROSSING,
        };
    }

    override clone(): TrackCrossingElement {
        const copy = new TrackCrossingElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        return copy;
    }

}