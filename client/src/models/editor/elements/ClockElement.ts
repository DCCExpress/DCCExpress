import { generateId } from "../../../helpers";
import { BaseElement } from "../core/BaseElement";
import { DrawOptions, ELEMENT_TYPES, IClockElement } from "../types/EditorTypes";

export class ClockElement extends BaseElement implements IClockElement {
    override type: typeof ELEMENT_TYPES.CLOCK = ELEMENT_TYPES.CLOCK;
    currentTime: Date = new Date();
    scale = 1;

    draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
        if (!this.visible) return;

        this.beginDraw(ctx, options);

        ctx.scale(this.scale, this.scale);

        const width = 120;
        const height = width;
        // const x = ctx.canvas.width / 2 - width / 2
        // var y = 10
        const x = this.centerX
        var y = this.centerY + 10

        const centerX = x + width / 2
        const centerY = height / 2 ;
        const radius = Math.min(width, height) / 2 - 10;

        // ctx.shadowBlur = 0;
        // ctx.shadowColor = "white";
        // ctx.shadowOffsetX = 0;
        // ctx.shadowOffsetY = 0;

        // ctx.beginPath()
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = "#ccc";
        // ctx.fillStyle = "#f0f0f0"
        // ctx.fillRect(x, y, width + 3, height + 3);
        // ctx.strokeRect(x, y, width + 3, height + 3);

        y += 4

        // Árnyék beállítása
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Óralap
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white"
        ctx.lineWidth = 6;
        ctx.fill()
        ctx.stroke();

        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Számok
        for (let i = 1; i <= 12; i++) {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = centerX + Math.cos(angle) * (radius - 12);
            const y = centerY + Math.sin(angle) * (radius - 12);
            ctx.font = "12px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(i.toString(), x, y + 2);
        }

        // Mutatók
        const hours = this.currentTime.getHours() % 12;
        const minutes = this.currentTime.getMinutes();
        const seconds = this.currentTime.getSeconds();

        const hourAngle = ((hours + minutes / 60) * 30 - 90) * (Math.PI / 180);
        const minuteAngle = ((minutes + seconds / 60) * 6 - 90) * (Math.PI / 180);
        const secondAngle = (seconds * 6 - 90) * (Math.PI / 180);

        // Óra középpont
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();

        // Óramutató
        this.drawHand(ctx, centerX, centerY, hourAngle, radius * 0.5, 6, "black");

        // Percmutató
        this.drawHand(ctx, centerX, centerY, minuteAngle, radius * 0.7, 4, "black");

        // Másodpercmutató
        this.drawHand(ctx, centerX, centerY, secondAngle, radius * 0.85, 2, "red");

        // Óra középpont
        ctx.beginPath();
        ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();

        this.endDraw(ctx);
        super.drawSelection(ctx);
        //super.draw(ctx)
    }

    private drawHand(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number, width: number, color: string) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }
    override clone(): ClockElement {
        const copy = new ClockElement(this.x, this.y);
        copy.id = generateId();
        copy.rotation = this.rotation;
        copy.rotationStep = this.rotationStep;
        copy.selected = this.selected;
        return copy;
    }
}