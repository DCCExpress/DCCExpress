import { DrawOptions } from "../types/EditorTypes";
import { BaseElement } from "./BaseElement";

export type LayerId = "track" | "blocks" | "buildings" | string;

export class Layer {
  public readonly id: LayerId;
  public name: string;
  public visible: boolean;
  public locked: boolean;
  public elements: BaseElement[];

  constructor(id: LayerId, name: string, options?: Partial<Pick<Layer, "visible" | "locked">>) {
    this.id = id;
    this.name = name;
    this.visible = options?.visible ?? true;
    this.locked = options?.locked ?? false;
    this.elements = [];
  }

  add(element: BaseElement): void {
    this.elements.push(element);
  }

  remove(element: BaseElement): void {
    this.elements = this.elements.filter(e => e !== element);
  }

  clear(): void {
    this.elements = [];
  }

  draw(ctx: CanvasRenderingContext2D, options: DrawOptions) {
    this.elements.forEach(e => e.draw(ctx, options));
  }

  hitTest(x: number, y: number): boolean {
    this.elements.forEach((e) => {
      if (e.hitTest(x, y)) {
        return true;
      }
    })
    return false;
  }
}