import { generateId } from "../../../helpers";
import { AddressedElement } from "../core/AddressedElement";
import { DrawOptions, ELEMENT_TYPES, ElementType, ITrackTurnoutDoubleElement, RotationStep } from "../types/EditorTypes";

export default class TrackTurnoutDoubleElement extends AddressedElement {
    type = ELEMENT_TYPES.TRACK_TURNOUT_DOUBLE;
    name: string = ELEMENT_TYPES.TRACK_TURNOUT_DOUBLE;
    rotationStep: RotationStep = 45;
    turnoutLocked: string | CanvasGradient | CanvasPattern = "yellow";
    turnoutUnLocked: string | CanvasGradient | CanvasPattern = "red";

    turnout1Address: number = 0;
    turnout2Address: number = 0;



    override draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

        this.drawTurnout(ctx, false, false);
       
        this.endDraw(ctx);

        
        super.drawSelection(ctx);
    }

    drawTurnout(ctx: CanvasRenderingContext2D, t1Closed: boolean, t2Closed: boolean) {
        {
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
            // var color = Colors.TrackLightColor
            // switch (this.state) {
            //     case RailStates.selected: color = Colors.TrackSelectedColor
            //         break;
            //     case RailStates.occupied: color = Colors.TrackDangerColor
            //         break;
            // }


            ctx.beginPath();
            ctx.strokeStyle = this.stateColor
            ctx.lineWidth = this.TrackWidth3;
            var dx = this.width / 5

            // t1 Color
            //ctx.strokeStyle = 'lime'
            if (this.rotation == 0) {
                if (t1Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.posTop + dx)
                }
                else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.centerY)
                }
            } else if (this.rotation == 45) {
                if (t1Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.centerX, this.posTop + dx)
                } else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.posTop + dx)
                }
            } else if (this.rotation == 90) {
                if (t1Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.posTop + dx)
                } else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.centerX, this.posTop + dx)
                }
            } else if (this.rotation == 135) {
                if (t1Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.centerY)
                } else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.posTop + dx)
                }
            } else if (this.rotation == 180) {
                if (t1Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.posBottom - dx)
                } else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.centerY)
                }
            } else if (this.rotation == 225) {
                if (t1Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.centerX, this.posBottom - dx)
                } else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.posBottom - dx)
                }
            } else if (this.rotation == 270) {
                if (t1Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.posBottom - dx)
                } else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.centerX, this.posBottom - dx)
                }
            } else if (this.rotation == 315) {
                if (t1Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.centerY)
                } else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.posBottom - dx)
                }
            }
            ctx.stroke()

            // t2 Color
            ctx.beginPath();
            //ctx.strokeStyle = 'cornflowerblue'
            if (this.rotation == 0) {
                if (t2Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.posBottom - dx)
                }
                else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.centerY)
                }
            } if (this.rotation == 45) {
                if (t2Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.centerX, this.posBottom - dx)
                }
                else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.posBottom - dx)
                }
            } if (this.rotation == 90) {
                if (t2Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.posBottom - dx)
                }
                else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.centerX, this.posBottom - dx)
                }
            } if (this.rotation == 135) {
                if (t2Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.centerY)
                }
                else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.posBottom - dx)
                }
            } if (this.rotation == 180) {
                if (t2Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.posTop + dx)
                }
                else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.centerY)
                }
            } if (this.rotation == 225) {
                if (t2Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.centerX, this.posTop + dx)
                }
                else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posLeft + dx, this.posTop + dx)
                }
            } else if (this.rotation == 270) {
                if (t2Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.posTop + dx)
                }
                else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.centerX, this.posTop + dx)
                }
            } else if (this.rotation == 315) {
                if (t2Closed) {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.centerY)
                }
                else {
                    ctx.moveTo(this.centerX, this.centerY)
                    ctx.lineTo(this.posRight - dx, this.posTop + dx)
                }
            }
            ctx.stroke()

        }

        ctx.beginPath();
        ctx.lineWidth = 1
        ctx.strokeStyle = "black"
        ctx.fillStyle = this.locked ? this.turnoutLocked : this.turnoutUnLocked
        ctx.arc(this.centerX, this.centerY, 3, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

    }

    override toJSON(): ITrackTurnoutDoubleElement {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.TRACK_TURNOUT_DOUBLE,
            turnout1Address: this.turnout1Address,
            turnout2Address: this.turnout2Address
        };
    }

    override clone(): TrackTurnoutDoubleElement {
        const copy = new TrackTurnoutDoubleElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.turnout1Address = this.turnout1Address;
        copy.turnout2Address = this.turnout2Address;
        return copy;
    }

}