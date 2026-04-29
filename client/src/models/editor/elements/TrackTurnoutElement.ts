
import { SetTurnoutMessage } from "../../../../../common/src/types";
import Api from "../../../api/Api";
import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { wsApi } from "../../../services/wsApi";
import { AddressedElement } from "../core/AddressedElement";
import { BaseElement } from "../core/BaseElement";
import { ClickableBaseElement } from "../core/ClickableBaseElement";
import { DrawOptions, ELEMENT_TYPES, ElementType, ITrackCornerElement, ITrackTurnoutLeftElement } from "../types/EditorTypes";
import { IEditableProperty } from "./PropertyDescriptor";
import { TrackTurnoutRightElement } from "./TrackTurnoutRightElement";

export abstract class  TrackTurnoutElement extends ClickableBaseElement {
    //override type: typeof ELEMENT_TYPES.TRACK_TURNOUT = ELEMENT_TYPES.TRACK_TURNOUT;
    address: number = 0;
    turnoutLocked: string | CanvasGradient | CanvasPattern = "yellow";
    turnoutUnLocked: string | CanvasGradient | CanvasPattern = "red";
    turnoutAddress: number = 0;
    turnoutClosedValue: boolean = false;
    turnoutClosed: boolean = false;

    constructor(x: number, y: number) {
        super(x, y);
        this.rotationStep = 45;
    }

    override draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);
        this.drawTurnout(ctx, this.turnoutClosed);
        this.endDraw(ctx);
        
        this.beginDraw(ctx);
        if (options?.showTurnoutAddress) {
            drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.turnoutAddress.toString())
        }
        this.endDraw(ctx);

        super.drawSelection(ctx);
    }

    abstract drawTurnout(ctx: CanvasRenderingContext2D, t1Closed: boolean): void;

    mouseDown(ev: MouseEvent) {
        const closed = this.turnoutClosed == this.turnoutClosedValue;
        wsApi.setTurnout(this.turnoutAddress, !closed);
    }

    toggle() {
        const closed = this.turnoutClosed == this.turnoutClosedValue;
        wsApi.setTurnout(this.turnoutAddress, !closed);
    }

    mouseUp(ev: MouseEvent) {
        //alert("UP")
    }

    



    override getEditableProperties(): IEditableProperty[] {
        return [
            ...super.getEditableProperties(),
            { label: "Turnout Address", key: "turnoutAddress", type: "number", readonly: false, validate: (v) => { return true } },
            { label: "Closed Value", key: "turnoutClosedValue", type: "bittoggle", readonly: false, validate: (v) => { return true } },
        ];
    }
}