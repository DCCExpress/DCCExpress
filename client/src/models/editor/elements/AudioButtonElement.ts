import { generateId } from "../../../helpers";
import { BaseElement } from "../core/BaseElement";
import { DrawOptions, ELEMENT_TYPES, IAudioButtonElement } from "../types/EditorTypes";

export class AudioButtonElement extends BaseElement implements IAudioButtonElement {
    override type: typeof ELEMENT_TYPES.BUTTON_AUDIO = ELEMENT_TYPES.BUTTON_AUDIO;
    fileName: string = "";
    label: string = "Audio";
    colorOn: string = "lime";
    constructor(x: number, y: number) {
        super(x, y);
        this.type = ELEMENT_TYPES.BUTTON_AUDIO;
        this.rotationStep = 45;
        this.layerName = "buildings"
    }

    draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

        {
            const p = 5; // padding
            
            ctx.lineWidth = 1;
            ctx.strokeStyle = "gainsboro";
            ctx.strokeRect(this.posLeft + p, this.posTop + p, this.width - 2 * p, this.height - 2 * p)

            const x = this.posLeft + 3
            const y = this.posTop + 3
            const size = 35

            
            ctx.translate(x, y);
            ctx.scale(size / 24, size / 24);

            ctx.fillStyle = "gray";

            ctx.beginPath();
            ctx.moveTo(5, 9);
            ctx.lineTo(5, 15);
            ctx.lineTo(9, 15);
            ctx.lineTo(14, 20);
            ctx.lineTo(14, 4);
            ctx.lineTo(9, 9);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(15, 12, 3, Math.PI / -2, Math.PI / 2); // Körív létrehozása a hangerőhöz
            ctx.fill();
        }

        this.endDraw(ctx);
        super.drawSelection(ctx);
        //super.draw(ctx)
    }

    override toJSON(): IAudioButtonElement {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.BUTTON_AUDIO,
            fileName: this.fileName,
            label: this.label,
            colorOn: this.colorOn
        };
    }

    override clone(): AudioButtonElement {
        const copy = new AudioButtonElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.fileName = this.fileName;
        copy.label = this.label;
        copy.colorOn = this.colorOn;
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