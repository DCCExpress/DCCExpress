// import { BaseElement } from "./BaseElement";
// import { Layer, LayerId } from "./Layer";

// export class EditorLayers {
//   private _layers: Layer[] = [];
//   private _activeLayerId: LayerId = "track";
//   //track: Layer = new Layer("track", "track")
//   constructor() {
//     this._layers = [
//       new Layer("track", "Pálya"),
//       new Layer("blocks", "Blokkok"),
//       new Layer("buildings", "Épületek")
//     ];
//   }

//   public get layers(): Layer[] {
//     return this._layers;
//   }

//   public get activeLayerId(): LayerId {
//     return this._activeLayerId;
//   }

//   public set activeLayerId(value: LayerId) {
//     const exists = this._layers.some(l => l.id === value);
//     if (exists) {
//       this._activeLayerId = value;
//     }
//   }

//   public get activeLayer(): Layer {
//     const layer = this.getLayer(this._activeLayerId);
//     if (!layer) {
//       throw new Error(`Active layer not found: ${this._activeLayerId}`);
//     }
//     return layer;
//   }

//   public get track(): Layer {
//     return this.requireLayer("track");
//   }

//   public get blocks(): Layer {
//     return this.requireLayer("blocks");
//   }

//   public get buildings(): Layer {
//     return this.requireLayer("buildings");
//   }

//   public addLayer(id: LayerId, name: string): Layer {
//     const existing = this.getLayer(id);
//     if (existing) {
//       return existing;
//     }

//     const layer = new Layer(id, name);
//     this._layers.push(layer);
//     return layer;
//   }

//   public getLayer(id: LayerId): Layer | undefined {
//     return this._layers.find(l => l.id === id);
//   }

//   public requireLayer(id: LayerId): Layer {
//     const layer = this.getLayer(id);
//     if (!layer) {
//       throw new Error(`Layer not found: ${id}`);
//     }
//     return layer;
//   }

//   public addElement(element: BaseElement, layerId?: LayerId): void {
//     const layer = layerId ? this.requireLayer(layerId) : this.activeLayer;

//     if (layer.locked) {
//       return;
//     }

//     layer.add(element);
//   }

//   public removeElement(element: BaseElement): void {
//     for (const layer of this._layers) {
//       const index = layer.elements.indexOf(element);
//       if (index >= 0) {
//         layer.elements.splice(index, 1);
//         return;
//       }
//     }
//   }

//   public clearAll(): void {
//     for (const layer of this._layers) {
//       layer.clear();
//     }
//   }

//   public getAllVisibleElements(): BaseElement[] {
//     return this._layers
//       .filter(layer => layer.visible)
//       .flatMap(layer => layer.elements);
//   }

//   public getAllElements(): BaseElement[] {
//     return this._layers.flatMap(layer => layer.elements);
//   }

//   public findLayerOfElement(element: BaseElement): Layer | undefined {
//     return this._layers.find(layer => layer.elements.includes(element));
//   }


//   getElement(x: number, y: number): BaseElement | null {
//     for (const l of this.layers) {
//       for (const e of l.elements) {
//         if (e.hitTest(x, y)) {
//           return e;
//         }
//       }
//     }
//     return null;
//   }

//   getSelected(): BaseElement | null {
//     for (const l of this.layers) {
//       for (const e of l.elements) {
//         if (e.selected) {
//           return e;
//         }
//       }
//     }
//     return null;
//   }

//   setSelected(be: BaseElement) {
//     this.unselectAll();
//     for (const l of this.layers) {
//       for (const e of l.elements) {
//         if (e.id === be.id) {
//           e.selected = true;
//         }
//       }
//     }
//   }

//   unselectAll() {
//     for (const l of this.layers) {
//       for (const e of l.elements) {
//         e.selected = false;
//       }
//     }
//   }

//   draw(ctx: CanvasRenderingContext2D) {
//     for (const l of this.layers) {
//       l.draw(ctx);
//     }
//   }
//   //  public hitTestWithLayer(
//   //   x: number,
//   //   y: number,
//   //   options?: { includeLocked?: boolean }
//   // ): [Layer, BaseElement] | [null, null] {
//   //   const includeLocked = options?.includeLocked ?? true;

//   //   for (let layerIndex = this._layers.length - 1; layerIndex >= 0; layerIndex--) {
//   //     const layer = this._layers[layerIndex];

//   //     if (!layer.visible) continue;
//   //     if (!includeLocked && layer.locked) continue;

//   //     for (let elementIndex = layer.elements.length - 1; elementIndex >= 0; elementIndex--) {
//   //       const element = layer.elements[elementIndex];

//   //       if (this.isElementHit(element, x, y)) {
//   //         return [layer, element];
//   //       }
//   //     }
//   //   }

//   //   return [null, null];
//   // }
// }