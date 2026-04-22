import { drawTextWithRoundedBackground } from "../../../graphics";
import { generateId } from "../../../helpers";
import { IEditableProperty } from "../elements/PropertyDescriptor";
import { DrawOptions, IAddressedElement, IBaseElement } from "../types/EditorTypes";
import { BaseElement } from "./BaseElement";

export class AddressedElement extends BaseElement {
    address: number = 0;

    override toJSON(): IAddressedElement {
        return {
            ...super.toJSON(),
            address: this.address
        };
    }

    override clone(): AddressedElement {
        const copy = new AddressedElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.address = this.address;
        return copy;
    }

    override getEditableProperties(): IEditableProperty[] {

        return [
            ...super.getEditableProperties(),
            { label: "Sensor Address", key: "address", type: "number", readonly: false, validate: (v) => { return v > 10 } },
        ];
    }

    // drawAddress(ctx: CanvasRenderingContext2D) {
    //     this.beginDraw(ctx);
    //         drawTextWithRoundedBackground(ctx, this.posLeft, this.posBottom - 10, "#" + this.address.toString())
    //     this.endDraw(ctx);
    // }
}