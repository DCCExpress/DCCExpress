import Api from "../../../api/Api";
import { getRotatedRectPoints } from "../../../graphics";
import { generateId } from "../../../helpers";
import { BaseElement } from "../core/BaseElement";
import { IRect } from "../core/Rect";
import { DrawOptions, ELEMENT_TYPES, IBlockElement } from "../types/EditorTypes";
import { IEditableProperty } from "./PropertyDescriptor";

export class BlockElement extends BaseElement implements IBlockElement {
    override type: typeof ELEMENT_TYPES.TRACK_BLOCK = ELEMENT_TYPES.TRACK_BLOCK;
    text: string = 'HELLO';
    textColor: string = 'black';
    locoAddress: number = 0;
    length: number = 1;
    sensorAddress: number = 0;

    constructor(x: number, y: number) {
        super(x, y);
        this.layerName = "blocks";
        this.rotationStep = 90;
        this.w = 3;
        this.h = 1;
    }

    draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.translate(-this.centerX, -this.centerY);

        const r = this.getBounds();

        let bg = options?.darkMode ? "#888888" : "#f0f0f0";  // A színe lehet más is
        let fg = "black";

        ctx.fillStyle = bg!;  // A színe lehet más is
        ctx.strokeStyle = fg!;
        ctx.lineWidth = 1
        ctx.strokeStyle = 'black';

        ctx.fillRect(this.posLeft + 5, this.posTop + 10, this.width - 10, this.height - 20);
        ctx.strokeRect(this.posLeft + 5, this.posTop + 10, this.width - 10, this.height - 20);
        //ctx.strokeRect(this.posLeft + 10, this.centerY - h, this.width - 20, 2 * h);

        this.drawSelection(ctx);
        this.endDraw(ctx);

    }

    draw22(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

        const c = Math.ceil(this.w / 2);

        let bg = "#868686";  // A színe lehet más is
        let fg = "black";
        let text = ""
        if (this.locoAddress > 0) {
            text = `${this.locoAddress}`
            const loco = Api.getLoco(this.locoAddress)
            if (loco) {
                //text += ` ${loco.name}`
                text += ` ${loco}`
                bg = "lime";
                fg = "black";

            } else {
                text += " undef"
                bg = "red";
                fg = "yellow";
            }
        }



        var w = this.GridSizeX / 2.0
        var h = this.GridSizeY / 6.0

        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.translate(-this.centerX, -this.centerY);

        ctx.fillStyle = "red";  // A színe lehet más is
        ctx.strokeStyle = fg!;

        ctx.fillRect(this.posLeft + 10, this.centerY - h, this.width - 20, 2 * h);

        ctx.lineWidth = 1
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.posLeft + 10, this.centerY - h, this.width - 20, 2 * h);

        // Triangle
        ctx.fillStyle = 'black';
        ctx.beginPath();

        //if (Globals.Settings.EditorSettings.Orientation == DCCExDirections.forward) {
        if (true) {
            ctx.moveTo(this.posRight - 15, this.centerY);
            ctx.lineTo(this.posRight - 20, this.centerY - 3);
            ctx.lineTo(this.posRight - 20, this.centerY + 3);
        } else {
            ctx.moveTo(this.posLeft + 15, this.centerY);
            ctx.lineTo(this.posLeft + 20, this.centerY - 3);
            ctx.lineTo(this.posLeft + 20, this.centerY + 3);
        }
        ctx.closePath();
        ctx.fill();


        // if (this.text) 
        {
            if (this.rotation == 180) {
                ctx.restore()
            }


            ctx.fillStyle = fg;
            ctx.font = "8px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, this.centerX, this.centerY + 1);
        }

        super.drawBounds(ctx)

        super.drawSelection(ctx);

        this.endDraw(ctx);

        //this.drawSelectionBox(ctx);
        //super.drawOccupied(ctx);

    }

    override getBounds(): IRect {

        const c = Math.ceil(this.w / 2);
        if (this.rotation == 0 || this.rotation == 180) {
            return {
                x: this.x - 1, //this.posLeft,
                y: this.y,
                width: this.w ,
                height: this.h
            }
        }

            return {
                x: this.x , //this.posLeft,
                y: this.y - 1,
                width: this.h,
                height: this.w
            }


        if (this.rotation == 0 || this.rotation == 180) {
            //alert("90")
            return {
                x: this.x, //this.posLeft,
                y: this.y,
                width: this.h,
                height: this.w
            }

        }
        //alert("90")
        return {
            x: this.x, //this.posLeft,
            y: this.y,
            width: this.h,
            height: this.w
        }
    }

    override get posLeft(): number {
        return (this.x - 1) * this.GridSizeX
    }
    override get posRight(): number {
        return (this.x - 1) * this.GridSizeX + this.w * this.GridSizeX
    }
    override get posTop(): number {
        return this.y * this.GridSizeY
    }
    override get posBottom(): number {
        return this.y * this.GridSizeY + this.h * this.GridSizeY
    }

    override get centerX(): number {
        return this.x * this.GridSizeX + this.GridSizeX / 2
    }
    override get centerY(): number {
        return this.y * this.GridSizeY + this.GridSizeY / 2
    }


    override clone(): BlockElement {
        const copy = new BlockElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        return copy;
    }

    override getEditableProperties(): IEditableProperty[] {
        return [
            ...super.getEditableProperties(),
            { label: "Length", key: "length", type: "number", readonly: false },
            { label: "Sensor Address", key: "address", type: "number", readonly: false },
            { label: "Color ON", key: "colorOn", type: "colorpicker", readonly: false },
        ];
    }
}