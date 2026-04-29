// limitations under the License.

import { IAddressedElement } from "../types/EditorTypes";
import { AddressedElement } from "./AddressedElement";
import { BaseElement } from "./BaseElement";

export abstract class ClickableBaseElement extends BaseElement {

    mouseDown(ev: MouseEvent) {
    }

    mouseUp(ev: MouseEvent) {
    }

    
}