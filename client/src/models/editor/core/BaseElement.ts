import { generateId } from "../../../helpers";
import { IEditableProperty } from "../elements/PropertyDescriptor";
import { sampleLayout } from "../sample/sampleLayout";
import { ELEMENT_TYPES, ElementType } from "../types/EditorTypes";
import { DrawOptions, IBaseElement, RotationStep } from "../types/EditorTypes";
import { LayerId } from "./Layer";
import { IRect } from "./Rect";

export enum RailStates {
    free, selected, occupied
}

export const RailColors = { free: "gray", selected: "yellow", occupied: "red" }


export abstract class BaseElement implements IBaseElement {
    id: string = "";
    type: ElementType = ELEMENT_TYPES.GENERAL;
    name: string = "element";
    layerName: LayerId = "track";
    // Ezek grid poziciók és méretek
    x: number;
    y: number;
    w: number = 1;
    h: number = 1;
    rotation: number = 0;
    rotationStep: RotationStep = 0;
    selected: boolean = false;
    enabled: boolean = true;
    locked: boolean = false;
    visible: boolean = true;
    bg: string = "black";
    fg: string = "white";
    occupied: boolean = false;

    railState: RailStates = RailStates.free;
    //length: number = 1;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;

    }

    rotateRight(): void {
        if (this.locked) return;
        this.rotation = this.normalizeRotation(this.rotation + this.rotationStep);
    }

    rotateLeft(): void {
        if (this.locked) return;
        this.rotation = this.normalizeRotation(this.rotation - this.rotationStep);
    }

    setRotation(rotation: number): void {
        if (this.locked) return;
        this.rotation = this.normalizeRotation(rotation);
    }

    moveBy(dx: number, dy: number): void {
        if (this.locked) return;
        this.x += dx;
        this.y += dy;
    }

    setPosition(x: number, y: number): void {
        if (this.locked) return;
        this.x = x;
        this.y = y;
    }

    get GridSizeX(): number { return sampleLayout.settings.gridSize; }
    get GridSizeY(): number { return sampleLayout.settings.gridSize; }

    public get PositionX(): number {
        return this.x * this.GridSizeX
    }

    public get PositionY(): number {
        return this.y * this.GridSizeY
    }

    get posLeft(): number {
        return this.x * this.GridSizeX
    }
    get posRight(): number {
        return this.x * this.GridSizeX + this.w * this.GridSizeX
    }
    get posTop(): number {
        return this.y * this.GridSizeY
    }
    get posBottom(): number {
        return this.y * this.GridSizeY + this.h * this.GridSizeY
    }
    public get centerX(): number {
        return this.x * this.GridSizeX + this.w * this.GridSizeX / 2
    }
    public get centerY(): number {
        return this.y * this.GridSizeY + this.h * this.GridSizeY / 2
    }
    get width(): number {
        return this.posRight - this.posLeft
    }
    get height(): number {
        return this.posBottom - this.posTop
    }

    get TrackWidth7(): number {
        return 7;
    }

    get TrackWidth3(): number {
        return 3;
    }

    get TrackPrimaryColor(): string {
        return "black";
    }

    get stateColor(): string {
        switch (this.railState) {
            case RailStates.selected: return RailColors.selected;
            case RailStates.occupied: return RailColors.occupied;
        }
        return RailColors.free;
    }

    protected normalizeRotation(value: number): number {
        let result = value % 360;
        if (result < 0) result += 360;
        return result;
    }

    protected beginDraw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
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

    protected endDraw(ctx: CanvasRenderingContext2D): void {
        ctx.restore();
    }

    protected drawSelectionBox(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#3b82f6";
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(this.posLeft, this.posTop, this.width, this.height);
        ctx.restore();
    }

    protected drawOccupied(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        //ctx.lineWidth = 1;
        ctx.fillStyle = "#403b82f6";
        //ctx.setLineDash([4, 3]);
        ctx.fillRect(this.posLeft, this.posTop, this.width, this.height);
        ctx.restore();
    }

    drawSelection(ctx: CanvasRenderingContext2D): void {

        this.drawEnabled(ctx);

        if (this.selected) {

            this.beginDraw(ctx);
            // ctx.translate(this.centerX, this.centerY);
            // ctx.rotate(this.degreesToRadians(this.rotation));
            // ctx.rotate(0);
            // ctx.translate(-this.centerX, -this.centerY);
            var w2 = this.GridSizeX / 2.0
            var h2 = this.GridSizeY / 2.0
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "red";

            ctx.strokeRect(this.posLeft, this.posTop, this.width, this.height);

            this.endDraw(ctx);
        }


    }

    protected drawEnabled(ctx: CanvasRenderingContext2D): void {
        if (!this.enabled) {
            ctx.save();
            ctx.fillStyle = "#6e6e6e67";
            ctx.fillRect(this.posLeft, this.posTop, this.width, this.height);
            ctx.restore();
        }
    }

    mouseDown(ev: MouseEvent) {
    }

    mouseUp(ev: MouseEvent) {
    }

    toJSON(): IBaseElement {
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

    draw(ctx: CanvasRenderingContext2D, options?: DrawOptions) {

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

    degreesToRadians(degrees: number) {
        return degrees * Math.PI / 180;
    }


    getBounds(): IRect {
        return {
            x: this.x, //this.posLeft,
            y: this.y,
            width: this.w,
            height: this.h
        }
    }

    drawBounds(ctx: CanvasRenderingContext2D) {
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
    hitTest(px: number, py: number): boolean {
        const r = this.getBounds();
        const x2 = r.x + r.width;
        const y2 = r.y + r.height;
        return px >= r.x && py >= r.y && px < x2 && py < y2;

        return this.x == px && this.y == py;
    }

    abstract clone(): BaseElement;

    getEditableProperties(): IEditableProperty[] {
        return [
            { label: "Name", key: "name", type: "string", readonly: false },
            // { label: "Forgatás", key: "rotation", type: "number", readonly: true },
        ];
    }

    getHelp(): string {
        return `
    <h3 style="margin-top:0;">Base element</h3>
      `;
    }
}