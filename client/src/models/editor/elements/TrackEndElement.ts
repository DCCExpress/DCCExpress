import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { AddressedElement} from "../core/AddressedElement";
import { BaseElement } from "../core/BaseElement";
import { sampleLayout } from "../sample/sampleLayout";
import { DrawOptions, ELEMENT_TYPES, ElementType, ITrackEndElement } from "../types/EditorTypes";

export class TrackEndElement extends AddressedElement implements ITrackEndElement {
    override type = ELEMENT_TYPES.TRACK_END
    constructor(x: number, y: number) {
        super(x, y);
        this.rotationStep = 45;
    }

    draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

        {
            var h = this.GridSizeY / 4.0


            ctx.translate(this.centerX, this.centerY);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.translate(-this.centerX, -this.centerY);

            ctx.lineWidth = this.TrackWidth7;
            ctx.strokeStyle = this.TrackPrimaryColor

            if (this.rotation % 90 == 0) {
                ctx.beginPath();
                ctx.moveTo(this.PositionX, this.centerY);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.moveTo(this.centerX, this.centerY - h);
                ctx.lineTo(this.centerX, this.centerY + h);
                ctx.stroke();
            } else {
                var r = this.GridSizeX / 2
                var l = Math.sqrt(2 * r * r)

                ctx.beginPath();
                ctx.moveTo(this.centerX - l, this.centerY);
                ctx.lineTo(this.centerX, this.centerY);
                ctx.moveTo(this.centerX, this.centerY - h);
                ctx.lineTo(this.centerX, this.centerY + h);
                ctx.stroke();
            }

            ctx.lineWidth = this.TrackWidth3;
            ctx.strokeStyle = this.stateColor;


            const p = this.GridSizeX / 4;
            if (this.rotation % 90 == 0) {
                ctx.beginPath();
                ctx.moveTo(this.PositionX + p, this.centerY);
                ctx.lineTo(this.centerX - this.TrackWidth7 / 2, this.centerY);
                ctx.stroke();
            } else {
                var r = this.GridSizeX / 2
                var l = Math.sqrt(2 * r * r) - p

                ctx.beginPath();
                ctx.moveTo(this.centerX - l, this.centerY);
                ctx.lineTo(this.centerX - this.TrackWidth7 / 2, this.centerY);
                ctx.stroke();
            }
        }

        // drawPolarLine(ctx, this.centerX, this.centerY, settings.GridSizeX / 4, this.angle , color, settings.TrackWidth3)
        // // ctx.beginPath();

        this.endDraw(ctx);

        this.beginDraw(ctx)
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

    override toJSON(): ITrackEndElement {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_END
            // type: "trackend",
            // trackType: this.trackType,
            // length: this.length,
        };
    }

    override clone(): TrackEndElement {
        const copy = new TrackEndElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        return copy;
    }

}