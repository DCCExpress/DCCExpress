import { generateId } from "../../../helpers";
import { BaseElement } from "../core/BaseElement";
import { ELEMENT_TYPES } from "../types/EditorTypes";
export class TreeElement extends BaseElement {
    type = ELEMENT_TYPES.TREE;
    constructor(x, y) {
        super(x, y);
        this.layerName = "buildings";
        this.rotationStep = 45;
    }
    draw(ctx, options) {
        if (!this.visible)
            return;
        this.beginDraw(ctx, options);
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.translate(-this.centerX, -this.centerY);
        var x = this.centerX;
        var y = this.centerY;
        var r = this.width / 2 - 8;
        var colors = ["#4F8A10", "#5CA420", "#6EC13C"];
        this.drawTree(ctx, x, y, this.width / 2 - 3, colors);
        this.endDraw(ctx);
        super.drawSelection(ctx);
    }
    drawTree(ctx, x, y, r, colors) {
        ctx.beginPath();
        ctx.shadowBlur = 4;
        ctx.shadowColor = "gray";
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = colors[0];
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = colors[1];
        ctx.arc(x + 3, y + 3, r - 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = colors[2];
        ctx.arc(x + 5, y + 5, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    clone() {
        const copy = new TreeElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        return copy;
    }
}
