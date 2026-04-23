import { sampleLayout } from "../sample/sampleLayout";
import { ELEMENT_TYPES } from "../types/EditorTypes";
export class BaseElement {
    id = "";
    type = ELEMENT_TYPES.GENERAL;
    name = "element";
    layerName = "track";
    // Ezek grid poziciók és méretek
    x;
    y;
    w = 1;
    h = 1;
    rotation = 0;
    rotationStep = 0;
    selected = false;
    locked = false;
    visible = true;
    bg = "black";
    fg = "white";
    occupied = false;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    rotateRight() {
        if (this.locked)
            return;
        this.rotation = this.normalizeRotation(this.rotation + this.rotationStep);
    }
    rotateLeft() {
        if (this.locked)
            return;
        this.rotation = this.normalizeRotation(this.rotation - this.rotationStep);
    }
    setRotation(rotation) {
        if (this.locked)
            return;
        this.rotation = this.normalizeRotation(rotation);
    }
    moveBy(dx, dy) {
        if (this.locked)
            return;
        this.x += dx;
        this.y += dy;
    }
    setPosition(x, y) {
        if (this.locked)
            return;
        this.x = x;
        this.y = y;
    }
    get GridSizeX() { return sampleLayout.settings.gridSize; }
    get GridSizeY() { return sampleLayout.settings.gridSize; }
    get PositionX() {
        return this.x * this.GridSizeX;
    }
    get PositionY() {
        return this.y * this.GridSizeY;
    }
    get posLeft() {
        return this.x * this.GridSizeX;
    }
    get posRight() {
        return this.x * this.GridSizeX + this.w * this.GridSizeX;
    }
    get posTop() {
        return this.y * this.GridSizeY;
    }
    get posBottom() {
        return this.y * this.GridSizeY + this.h * this.GridSizeY;
    }
    get centerX() {
        return this.x * this.GridSizeX + this.w * this.GridSizeX / 2;
    }
    get centerY() {
        return this.y * this.GridSizeY + this.h * this.GridSizeY / 2;
    }
    get width() {
        return this.posRight - this.posLeft;
    }
    get height() {
        return this.posBottom - this.posTop;
    }
    get TrackWidth7() {
        return 7;
    }
    get TrackWidth3() {
        return 3;
    }
    get TrackPrimaryColor() {
        return "black";
    }
    get stateColor() {
        return "yellow";
    }
    normalizeRotation(value) {
        let result = value % 360;
        if (result < 0)
            result += 360;
        return result;
    }
    beginDraw(ctx, options) {
        const x = options?.overrideX ?? this.x;
        const y = options?.overrideY ?? this.y;
        const scale = options?.scale ?? 1;
        const offsetX = options?.offsetX ?? 0;
        const offsetY = options?.offsetY ?? 0;
        ctx.save();
        ctx.translate(offsetX, offsetY);
        //ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        if (options?.ghost) {
            ctx.globalAlpha = 0.5;
        }
    }
    endDraw(ctx) {
        ctx.restore();
    }
    drawSelectionBox(ctx) {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#3b82f6";
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(this.posLeft, this.posTop, this.width, this.height);
        ctx.restore();
    }
    drawOccupied(ctx) {
        ctx.save();
        //ctx.lineWidth = 1;
        ctx.fillStyle = "#403b82f6";
        //ctx.setLineDash([4, 3]);
        ctx.fillRect(this.posLeft, this.posTop, this.width, this.height);
        ctx.restore();
    }
    drawSelection(ctx) {
        if (this.selected) {
            this.beginDraw(ctx);
            // ctx.translate(this.centerX, this.centerY);
            // ctx.rotate(this.degreesToRadians(this.rotation));
            // ctx.rotate(0);
            // ctx.translate(-this.centerX, -this.centerY);
            var w2 = this.GridSizeX / 2.0;
            var h2 = this.GridSizeY / 2.0;
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.posLeft, this.posTop, this.width, this.height);
            this.endDraw(ctx);
        }
    }
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            layerName: this.layerName,
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            rotationStep: this.rotationStep,
            bg: this.bg,
            fg: this.fg,
        };
    }
    draw(ctx, options) {
    }
    // getBounds(): Rect {
    //     return {
    //         x: this.posLeft,
    //         y: this.posTop,
    //         width: 100,
    //         height: 100,
    //     };
    //     // return {
    //     //     x: this.x - this.GridSizeX,
    //     //     y: this.y - this.GridSizeX,
    //     //     width: this.GridSizeX,
    //     //     height: this.GridSizeX,
    //     // };
    // }
    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    getBounds() {
        return {
            x: this.x, //this.posLeft,
            y: this.y,
            width: this.w,
            height: this.h
        };
    }
    drawBounds(ctx) {
        const b = this.getBounds();
        //ctx.save();
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]); // szaggatott, jól látszik debughoz
        ctx.strokeRect(b.x * this.GridSizeX, b.y * this.GridSizeX, b.width * this.GridSizeX, b.height * this.GridSizeX);
        ctx.strokeStyle = "blue";
        ctx.strokeRect(b.x * this.GridSizeX, b.y * this.GridSizeX, this.GridSizeX, this.GridSizeX);
        //ctx.restore();
    }
    hitTest(px, py) {
        const r = this.getBounds();
        const x2 = r.x + r.width;
        const y2 = r.y + r.height;
        return px >= r.x && py >= r.y && px < x2 && py < y2;
        return this.x == px && this.y == py;
    }
    getEditableProperties() {
        return [
            { label: "Név", key: "name", type: "string", readonly: false },
            // { label: "Forgatás", key: "rotation", type: "number", readonly: true },
        ];
    }
    getHelp() {
        return `
    <h3 style="margin-top:0;">Base element</h3>
      `;
    }
}
