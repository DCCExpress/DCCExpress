import { IEditableProperty } from "../elements/PropertyDescriptor";
import { ELEMENT_TYPES, ElementType, ITrackBaseElement } from "../types/EditorTypes";
import { AddressedElement } from "./AddressedElement";
import { BaseElement } from "./BaseElement";

export class TrackBaseElement extends BaseElement implements ITrackBaseElement {
    override type: ElementType = ELEMENT_TYPES.TRACK_BASE_ELEMENT;
    length: number = 200;

    override toJSON(): ITrackBaseElement {
        return {
            ...super.toJSON(),
            
        };
    }

    override clone(): TrackBaseElement {
        const copy = new TrackBaseElement(this.x, this.y);
        copy.id = this.id;
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.length = this.length;
        return copy;
    }

    override getEditableProperties(): IEditableProperty[] {
        return [
            ...super.getEditableProperties(),
            { label: "Length", key: "length", type: "number", readonly: false, validate: (v) => { return v > 0 } },
        ];
    }
}