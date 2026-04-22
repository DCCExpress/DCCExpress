// limitations under the License.

import { IAddressedElement } from "../types/EditorTypes";
import { AddressedElement } from "./AddressedElement";

export class ClickableBaseElement extends AddressedElement implements IAddressedElement {

    mouseDown(ev: MouseEvent) {
    }

    mouseUp(ev: MouseEvent) {
    }
}