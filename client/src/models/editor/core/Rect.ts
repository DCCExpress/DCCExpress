export interface IPoint {
  x: number;
  y: number;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}


export class Point implements IPoint {
  x: number = 0;
  y: number = 0;
}

export class Rect implements IRect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  // --- derived ---
  get right(): number {
    return this.x + this.width;
  }

  get bottom(): number {
    return this.y + this.height;
  }

  get centerX(): number {
    return this.x + this.width / 2;
  }

  get centerY(): number {
    return this.y + this.height / 2;
  }

  clone(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  // --- basic checks ---

  containsPoint(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.right &&
      y >= this.y &&
      y <= this.bottom
    );
  }

  containsRect(r: Rect): boolean {
    return (
      r.x >= this.x &&
      r.right <= this.right &&
      r.y >= this.y &&
      r.bottom <= this.bottom
    );
  }

  intersects(r: Rect): boolean {
    return !(
      r.x > this.right ||
      r.right < this.x ||
      r.y > this.bottom ||
      r.bottom < this.y
    );
  }

  // --- grow / shrink ---

  grow(amount: number): Rect {
    return new Rect(
      this.x - amount,
      this.y - amount,
      this.width + amount * 2,
      this.height + amount * 2
    );
  }

  growXY(dx: number, dy: number): Rect {
    return new Rect(
      this.x - dx,
      this.y - dy,
      this.width + dx * 2,
      this.height + dy * 2
    );
  }

  inflate(dx: number, dy: number): this {
    this.x -= dx;
    this.y -= dy;
    this.width += dx * 2;
    this.height += dy * 2;
    return this;
  }

  // --- move ---

  translate(dx: number, dy: number): this {
    this.x += dx;
    this.y += dy;
    return this;
  }

  // --- corners ---

  getCorners(): Point[] {
    return [
      { x: this.x, y: this.y },
      { x: this.right, y: this.y },
      { x: this.right, y: this.bottom },
      { x: this.x, y: this.bottom },
    ];
  }

  // --- union / intersection rect ---

  union(r: Rect): Rect {
    const left = Math.min(this.x, r.x);
    const top = Math.min(this.y, r.y);
    const right = Math.max(this.right, r.right);
    const bottom = Math.max(this.bottom, r.bottom);

    return new Rect(left, top, right - left, bottom - top);
  }

  intersection(r: Rect): Rect | null {
    const left = Math.max(this.x, r.x);
    const top = Math.max(this.y, r.y);
    const right = Math.min(this.right, r.right);
    const bottom = Math.min(this.bottom, r.bottom);

    if (right <= left || bottom <= top) return null;

    return new Rect(left, top, right - left, bottom - top);
  }

  // --- rotate helpers ---

  getRotatedCorners(angleRad: number, cx = this.centerX, cy = this.centerY): Point[] {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    return this.getCorners().map(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;

      return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos,
      };
    });
  }

  getRotatedBounds(angleRad: number, cx = this.centerX, cy = this.centerY): Rect {
    const pts = this.getRotatedCorners(angleRad, cx, cy);

    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);

    const left = Math.min(...xs);
    const top = Math.min(...ys);
    const right = Math.max(...xs);
    const bottom = Math.max(...ys);

    return new Rect(left, top, right - left, bottom - top);
  }

  // --- debug draw (nagyon jól fog jönni neked) ---

  draw(ctx: CanvasRenderingContext2D, color = "red") {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
}