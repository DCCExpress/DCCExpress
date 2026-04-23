import { drawPolarLine, getPolarXy } from "../../../graphics";
import { generateId } from "../../../helpers";
import { BaseElement } from "../core/BaseElement";
import { ELEMENT_TYPES } from "../types/EditorTypes";
export class RouteButtonElement extends BaseElement {
    type = ELEMENT_TYPES.BUTTON_ROUTE;
    label = "Route";
    colorOn = "lime";
    active = false;
    constructor(x, y) {
        super(x, y);
        this.type = ELEMENT_TYPES.BUTTON_ROUTE;
        this.rotationStep = 45;
        this.layerName = "buildings";
    }
    drawArrowsSplit2(ctx, x, y, size = 24) {
        ctx.save();
        // pozicionálás + méretezés
        ctx.translate(x, y);
        const scale = size / 24;
        ctx.scale(scale, scale);
        ctx.strokeStyle = ctx.strokeStyle || "black";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // ---- első ág (alsó)
        ctx.beginPath();
        ctx.moveTo(21, 17);
        ctx.lineTo(15.6, 17); // közelítés (bezier helyett egyszerűsítve)
        ctx.moveTo(15.6, 17);
        ctx.bezierCurveTo(14, 17, 13, 16.5, 12, 15.5);
        ctx.bezierCurveTo(11.5, 15, 11.2, 14.5, 11, 14);
        ctx.moveTo(11, 14);
        ctx.bezierCurveTo(10, 12.5, 9, 12, 7, 12);
        ctx.lineTo(3, 12);
        ctx.stroke();
        // ---- felső ág
        ctx.beginPath();
        ctx.moveTo(21, 7);
        ctx.lineTo(15.6, 7);
        ctx.moveTo(15.6, 7);
        ctx.bezierCurveTo(14, 7, 13, 7.5, 12, 8.5);
        ctx.bezierCurveTo(11.5, 9, 11.2, 9.5, 11, 10);
        ctx.moveTo(11, 10);
        ctx.bezierCurveTo(10, 11.5, 9, 12, 7, 12);
        ctx.lineTo(3, 12);
        ctx.stroke();
        // ---- felső nyíl
        ctx.beginPath();
        ctx.moveTo(18, 10);
        ctx.lineTo(21, 7);
        ctx.lineTo(18, 4);
        ctx.stroke();
        // ---- alsó nyíl
        ctx.beginPath();
        ctx.moveTo(18, 20);
        ctx.lineTo(21, 17);
        ctx.lineTo(18, 14);
        ctx.stroke();
        ctx.restore();
    }
    draw(ctx, options) {
        if (!this.visible)
            return;
        this.beginDraw(ctx, options);
        // ctx.translate(this.PositionX, this.PositionY)
        // ctx.rotate(-90);
        // ctx.translate(-this.PositionX, -this.PositionY)
        // this.drawArrowsSplit2(ctx, this.PositionX, this.PositionY, 24) ;
        // this.endDraw(ctx);
        // return;
        {
            var fg = this.active ? "yellow" : "white";
            var bg = this.active ? "lime" : "#404040";
            const r = Math.min(this.width, this.height) / 2 - 2;
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
            ctx.fillStyle = bg;
            ctx.arc(this.centerX, this.centerY, r - 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            drawPolarLine(ctx, this.centerX, this.centerY, r - 6, 225, "white", 5);
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = fg;
            var p1 = getPolarXy(this.centerX, this.centerY, r - 6, 315);
            var p2 = getPolarXy(this.centerX, this.centerY, r - 6, 90);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(this.centerX, this.centerY);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        this.endDraw(ctx);
        super.drawSelection(ctx);
        //super.draw(ctx)
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: ELEMENT_TYPES.BUTTON_ROUTE,
            label: this.label,
            colorOn: this.colorOn
        };
    }
    clone() {
        const copy = new RouteButtonElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        copy.label = this.label;
        copy.colorOn = this.colorOn;
        return copy;
    }
    getHelp() {
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
