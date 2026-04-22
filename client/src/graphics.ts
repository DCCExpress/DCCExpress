import { IPoint } from "./models/editor/core/Rect";

const rad = Math.PI / 180.0

export function drawTextWithBackground(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    textColor: string = 'black',
    rectColor: string = 'lightgray'
) {
    
    const textMetrics = ctx.measureText(text);
    const padding = 2; 
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

    
    const rectWidth = textWidth + 2 * padding;
    const rectHeight = textHeight + 2 * padding;

    
    ctx.fillStyle = rectColor;
    ctx.fillRect(x, y, rectWidth, rectHeight);

    
    ctx.fillStyle = textColor;
    const textX = x + padding;
    const textY = y + padding + textMetrics.actualBoundingBoxAscent;
    ctx.fillText(text, textX, textY);
}

export function drawTextWithRoundedBackground(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    textColor: string = 'black',
    rectColor: string = 'lightgray',
    borderRadius: number = 2,
    padding: number = 2
) {
    ctx.save();

    const textMetrics = ctx.measureText(text);
    // const padding = 2; 
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

    const rectWidth = textWidth + 2 * padding;
    const rectHeight = textHeight + 2 * padding;

    ctx.fillStyle = rectColor;
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + rectWidth - borderRadius, y);
    ctx.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + borderRadius);
    ctx.lineTo(x + rectWidth, y + rectHeight - borderRadius);
    ctx.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - borderRadius, y + rectHeight);
    ctx.lineTo(x + borderRadius, y + rectHeight);
    ctx.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
    ctx.closePath();
    ctx.fill();

    
    ctx.fillStyle = textColor;
    ctx.textAlign = "left"
    const textX = x + padding;
    const textY = y + padding + textMetrics.actualBoundingBoxAscent;
    ctx.fillText(text, textX, textY);
    ctx.restore()
}

export function drawRectangle(ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number, h: number,
    borderColor: string = 'black',
    fillColor: string = 'lightgray') {
    ctx.beginPath()
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1
    ctx.rect(x, y, w, h);
    ctx.stroke()
}

export function getPolarXy(cx: number, cy: number, r: number, theta: number): IPoint {
    return { x: cx + r * Math.cos(theta * rad), y: cy + r * Math.sin(theta * rad) }
}
export function drawPolarLine(
    ctx: CanvasRenderingContext2D,
    centerX: number, centerY: number,
    r: number, theta: number,
    color: string = "black", lineWidth: number = 1
): void {
    
    const x1 = centerX //+ r1 * Math.cos(theta1);
    const y1 = centerY //+ r1 * Math.sin(theta1);
    const x2 = centerX + r * Math.cos(theta * rad);
    const y2 = centerY + r * Math.sin(theta * rad);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
}

export function rotatePoint(x: number, y: number, cx: number, cy: number, a: number) {
  const cos = Math.cos(a);
  const sin = Math.sin(a);

  const dx = x - cx;
  const dy = y - cy;

  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

export function getRotatedRectPoints(
  left: number,
  top: number,
  w: number,
  h: number,
  angle: number
) {
  const cx = left + w / 2;
  const cy = top + h / 2;

  return [
    rotatePoint(left, top, cx, cy, angle),
    rotatePoint(left + w, top, cx, cy, angle),
    rotatePoint(left + w, top + h, cx, cy, angle),
    rotatePoint(left, top + h, cx, cy, angle),
  ];
}

