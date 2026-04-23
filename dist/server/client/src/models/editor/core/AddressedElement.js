import { generateId } from "../../../helpers";
import { BaseElement } from "./BaseElement";
export class AddressedElement extends BaseElement {
    address = 0;
    toJSON() {
        return {
            ...super.toJSON(),
            address: this.address
        };
    }
    clone() {
        const copy = new AddressedElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.address = this.address;
        return copy;
    }
    getEditableProperties() {
        return [
            ...super.getEditableProperties(),
            { label: "Sensor Address", key: "address", type: "number", readonly: false, validate: (v) => { return v > 10; } },
        ];
    }
}
