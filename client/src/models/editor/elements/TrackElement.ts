import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { AddressedElement } from "../core/AddressedElement";
import { TrackBaseElement } from "../core/TrackBaseElement";
import { DrawOptions, ELEMENT_TYPES, ITrackElement } from "../types/EditorTypes";

export class TrackElement extends AddressedElement implements ITrackElement {
    override type: typeof ELEMENT_TYPES.TRACK = ELEMENT_TYPES.TRACK;
    constructor(x: number, y: number) {
        super(x, y);
        this.type = ELEMENT_TYPES.TRACK;
        this.rotationStep = 45;
        this.length = 200;
        //this.trackType = data.trackType;
        //this.length = data.length ?? 80;
    }

    draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

        {
            //ctx.lineWidth = Globals.TrackWidth7;
            //ctx.strokeStyle = Colors.TrackPrimaryColor
            ctx.lineWidth = 7;
            ctx.strokeStyle = "black"

            if (this.rotation == 0 || this.rotation == 180) {
                ctx.beginPath();
                ctx.moveTo(this.posLeft, this.centerY);
                ctx.lineTo(this.posLeft + this.GridSizeX, this.centerY);
                ctx.stroke();
            }
            else if (this.rotation == 45 || this.rotation == 225) {
                ctx.beginPath();
                ctx.moveTo(this.PositionX, this.PositionY);
                ctx.lineTo(this.PositionX + this.GridSizeX, this.PositionY + this.GridSizeY);
                ctx.stroke();
            }
            else if (this.rotation == 90 || this.rotation == 270) {
                ctx.beginPath();
                ctx.moveTo(this.centerX, this.PositionY);
                ctx.lineTo(this.centerX, this.PositionY + this.GridSizeY);
                ctx.stroke();
            }
            else if (this.rotation == 135 || this.rotation == 315) {
                ctx.beginPath();
                ctx.moveTo(this.PositionX + this.GridSizeX, this.PositionY);
                ctx.lineTo(this.PositionX, this.PositionY + this.GridSizeY);
                ctx.stroke();
            }

            //ctx.lineWidth = Globals.TrackWidth3;
            ctx.lineWidth = 3;

            // var color = Colors.TrackLightColor
            // switch(this.state) {
            //     case RailStates.selected : color = Colors.TrackSelectedColor
            //     break;
            //     case RailStates.occupied: color = Colors.TrackDangerColor
            //     break;
            // }

            //ctx.strokeStyle = this.stateColor
            ctx.strokeStyle = "yellow";

            var w4 = this.GridSizeX / 4

            if (this.rotation == 0 || this.rotation == 180) {
                ctx.beginPath();
                ctx.moveTo(this.posLeft + w4, this.centerY);
                ctx.lineTo(this.posRight - w4, this.centerY);
                ctx.stroke();
            }
            else if (this.rotation == 45 || this.rotation == 225) {
                ctx.beginPath();
                ctx.moveTo(this.posLeft + w4, this.posTop + w4);
                ctx.lineTo(this.posRight - w4, this.posBottom - w4);
                ctx.stroke();
            }
            else if (this.rotation == 90 || this.rotation == 270) {
                ctx.beginPath();
                ctx.moveTo(this.centerX, this.posTop + w4);
                ctx.lineTo(this.centerX, this.posBottom - w4);
                ctx.stroke();
            }
            else if (this.rotation == 135 || this.rotation == 315) {
                ctx.beginPath();
                ctx.moveTo(this.posRight - w4, this.posTop + w4);
                ctx.lineTo(this.posLeft + w4, this.posBottom - w4);
                ctx.stroke();
            }
        }

        if (options?.showOccupancySensorAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString())
        }

        this.endDraw(ctx);
        

        super.drawSelection(ctx);
        //super.draw(ctx)
    }




    // override toJSON(): IAddressedElement {
    //     return {
    //         ...super.toJSON(),
    //     };
    // }

    override clone(): TrackElement {
        const copy = new TrackElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.address = this.address;
        copy.length = this.length;

        return copy;
    }

    getHelp(): string {
        return `
    <h3 style="margin-top:0;">Track element</h3>
    <p>This is a straight track section.</p>
    <ul>
      <li>You can rotate it with R</li>
      <li>You can move it by drag and drop</li>
    </ul>
  `;
    }

}