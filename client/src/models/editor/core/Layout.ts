import { TrackElement } from "../elements/TrackElement";
import TrackTurnoutDoubleElement from "../elements/TrackTurnoutDoubleElement";
import { TrackTurnoutElement } from "../elements/TrackTurnoutElement";
import { TrackTurnoutLeftElement } from "../elements/TrackTurnoutLeftElement";
import { TrackTurnoutRightElement } from "../elements/TrackTurnoutRightElement";
import { TrackTurnoutTwoWayElement } from "../elements/TrackTurnoutTwoWayElement";
import { DrawOptions } from "../types/EditorTypes";
import { BaseElement } from "./BaseElement";
import { ElementFactory } from "./ElementFactory";
import { Layer, LayerId } from "./Layer";

export function isTurnoutElement(el: BaseElement | null | undefined) {
  return (
    el instanceof TrackTurnoutElement ||
    el instanceof TrackTurnoutLeftElement ||
    el instanceof TrackTurnoutRightElement ||
    el instanceof TrackTurnoutTwoWayElement ||
    el instanceof TrackTurnoutDoubleElement
  );
}

export class Layout {
    private layers: Layer[] = [];
    private _activeLayerId: LayerId = "track";
    gridSize: number = 40;
    constructor() {
        this.layers = [
            new Layer("buildings", "Épületek"),
            new Layer("blocks", "Blokkok"),
            new Layer("sensors", "Sensors"),
            new Layer("signals", "Signals"),
            new Layer("track", "Pálya"),
        ];

        const track = new TrackElement(10, 10)
        track.id = "track1";
        this.track.elements.push(track);

    }

    //   public get layers(): Layer[] {
    //     return this.layers;
    //   }

    public get activeLayerId(): LayerId {
        return this._activeLayerId;
    }

    public set activeLayerId(value: LayerId) {
        const exists = this.layers.some(l => l.id === value);
        if (exists) {
            this._activeLayerId = value;
        }
    }

    public get activeLayer(): Layer {
        const layer = this.getLayer(this._activeLayerId);
        if (!layer) {
            throw new Error(`Active layer not found: ${this._activeLayerId}`);
        }
        return layer;
    }

    public get track(): Layer {
        return this.requireLayer("track");
    }

    public get blocks(): Layer {
        return this.requireLayer("blocks");
    }

    public get sensors(): Layer {
        return this.requireLayer("sensors");
    }

    public get signals(): Layer {
        return this.requireLayer("signals");
    }

    public get buildings(): Layer {
        return this.requireLayer("buildings");
    }

    public addLayer(id: LayerId, name: string): Layer {
        const existing = this.getLayer(id);
        if (existing) {
            return existing;
        }

        const layer = new Layer(id, name);
        this.layers.push(layer);
        return layer;
    }

    public getLayer(id: LayerId): Layer | undefined {
        return this.layers.find(l => l.id === id);
    }

    public requireLayer(id: LayerId): Layer {
        const layer = this.getLayer(id);
        if (!layer) {
            throw new Error(`Layer not found: ${id}`);
        }
        return layer;
    }

    public addElement(element: BaseElement, layerId?: LayerId): void {
        const layer = layerId ? this.requireLayer(layerId) : this.activeLayer;

        if (layer.locked) {
            return;
        }

        layer.add(element);
    }

    public removeElement(element: BaseElement): void {
        for (const layer of this.layers) {
            const index = layer.elements.indexOf(element);
            if (index >= 0) {
                layer.elements.splice(index, 1);
                return;
            }
        }
    }

    public clearAll(): void {
        for (const layer of this.layers) {
            layer.clear();
        }
    }

    public getAllVisibleElements(): BaseElement[] {
        return this.layers
            .filter(layer => layer.visible)
            .flatMap(layer => layer.elements);
    }

    // public getAllElements(): BaseElement[] {
    //     return this.layers.flatMap(layer => layer.elements);
    // }

    public getAllElements(): BaseElement[] {
        return [
            ...this.track.elements,
            ...this.blocks.elements,
            ...this.sensors.elements,
            ...this.buildings.elements,
        ];
    }

    public getElementAtGrid(x: number, y: number): BaseElement | null {
        const all = this.getAllElements();

        for (let i = all.length - 1; i >= 0; i--) {
            const el = all[i]!;
            if (el.x === x && el.y === y) {
                return el;
            }
        }

        return null;
    }

    public isOccupied(x: number, y: number): boolean {
        return this.getElementAtGrid(x, y) !== null;
    }

    public findLayerOfElement(element: BaseElement): Layer | undefined {
        return this.layers.find(layer => layer.elements.includes(element));
    }

    getElement(x: number, y: number): BaseElement | null {
        for (const l of this.layers) {
            for (const e of l.elements) {
                if (e.hitTest(x, y)) {
                    return e;
                }
            }
        }
        return null;
    }

    getLayeredElement(be: BaseElement, x: number, y: number): BaseElement | null {
        for (const l of this.layers) {
            for (const e of l.elements) {
                if (e.hitTest(x, y) && e.layerName == be.layerName) {
                    return e;
                }
            }
        }
        return null;
    }


    public checkElementCollision(e1: BaseElement, e2: BaseElement) {
        const l1 = this.findLayerOfElement(e1);
        const l2 = this.findLayerOfElement(e2);
        console.log("COLLISION: ", l1, l2)
        return l1?.name == l2?.name;
    }

    public getElement22(x: number, y: number): BaseElement | null {
        const layers = [this.track, this.blocks, this.buildings];

        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i]!;

            for (let j = layer.elements.length - 1; j >= 0; j--) {
                const el = layer.elements[j]!;

                if (el.x === x && el.y === y) {
                    return el;
                }
            }
        }

        return null;
    }

    getElements(x: number, y: number): BaseElement[] {
        const list: BaseElement[] = [];
        for (const l of this.layers) {
            for (const e of l.elements) {
                if (e.hitTest(x, y)) {
                    list.push(e);
                }
            }
        }
        return list;
    }

    getElementById(id: string): BaseElement | undefined {
        const elements = this.getAllElements();
        return elements.find((x) => x.id == id);
    }
    isExists(x: number, y: number): boolean {
        return this.getElements(x, y).length > 0 ? true : false;
    }


    getSelected(): BaseElement | null {
        for (const l of this.layers) {
            for (const e of l.elements) {
                if (e.selected) {
                    return e;
                }
            }
        }
        return null;
    }

    setSelected(be: BaseElement) {
        this.unselectAll();
        for (const l of this.layers) {
            for (const e of l.elements) {
                if (e.id === be.id) {
                    e.selected = true;
                }
            }
        }
    }

    unselectAll() {
        for (const l of this.layers) {
            for (const e of l.elements) {
                e.selected = false;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, options: DrawOptions) {
        this.track.draw(ctx, options);
        this.sensors.draw(ctx, options);
        this.signals.draw(ctx, options);
        this.blocks.draw(ctx, options);
        this.buildings.draw(ctx, options);
    }

    getLayoutBounds() {
        const elements = this.getAllElements();

        if (elements.length === 0) {
            return null;
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const el of elements) {
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x);
            maxY = Math.max(maxY, el.y);
        }

        return { minX, minY, maxX, maxY };
    }

    static fromJSON(data: any): Layout {
        const layout = new Layout();

        layout.gridSize = data.gridSize ?? 40;

        if (data._activeLayerId) {
            layout.activeLayerId = data._activeLayerId;
        }

        if (!Array.isArray(data.layers)) {
            return layout;
        }

        for (const layerData of data.layers) {
            const layer = layout.getLayer(layerData.id);
            if (!layer) {
                continue;
            }

            layer.name = layerData.name ?? layer.name;
            layer.visible = layerData.visible ?? true;
            layer.locked = layerData.locked ?? false;
            layer.elements = ElementFactory.createMany(layerData.elements ?? []);
        }

        return layout;
    }
}