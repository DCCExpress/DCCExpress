import { TrackElement } from "../elements/TrackElement";
import { ElementFactory } from "./ElementFactory";
import { Layer } from "./Layer";
export class Layout {
    layers = [];
    _activeLayerId = "track";
    gridSize = 40;
    constructor() {
        this.layers = [
            new Layer("buildings", "Épületek"),
            new Layer("blocks", "Blokkok"),
            new Layer("sensors", "Sensors"),
            new Layer("signals", "Signals"),
            new Layer("track", "Pálya"),
        ];
        const track = new TrackElement(10, 10);
        track.id = "track1";
        this.track.elements.push(track);
    }
    //   public get layers(): Layer[] {
    //     return this.layers;
    //   }
    get activeLayerId() {
        return this._activeLayerId;
    }
    set activeLayerId(value) {
        const exists = this.layers.some(l => l.id === value);
        if (exists) {
            this._activeLayerId = value;
        }
    }
    get activeLayer() {
        const layer = this.getLayer(this._activeLayerId);
        if (!layer) {
            throw new Error(`Active layer not found: ${this._activeLayerId}`);
        }
        return layer;
    }
    get track() {
        return this.requireLayer("track");
    }
    get blocks() {
        return this.requireLayer("blocks");
    }
    get sensors() {
        return this.requireLayer("sensors");
    }
    get signals() {
        return this.requireLayer("signals");
    }
    get buildings() {
        return this.requireLayer("buildings");
    }
    addLayer(id, name) {
        const existing = this.getLayer(id);
        if (existing) {
            return existing;
        }
        const layer = new Layer(id, name);
        this.layers.push(layer);
        return layer;
    }
    getLayer(id) {
        return this.layers.find(l => l.id === id);
    }
    requireLayer(id) {
        const layer = this.getLayer(id);
        if (!layer) {
            throw new Error(`Layer not found: ${id}`);
        }
        return layer;
    }
    addElement(element, layerId) {
        const layer = layerId ? this.requireLayer(layerId) : this.activeLayer;
        if (layer.locked) {
            return;
        }
        layer.add(element);
    }
    removeElement(element) {
        for (const layer of this.layers) {
            const index = layer.elements.indexOf(element);
            if (index >= 0) {
                layer.elements.splice(index, 1);
                return;
            }
        }
    }
    clearAll() {
        for (const layer of this.layers) {
            layer.clear();
        }
    }
    getAllVisibleElements() {
        return this.layers
            .filter(layer => layer.visible)
            .flatMap(layer => layer.elements);
    }
    // public getAllElements(): BaseElement[] {
    //     return this.layers.flatMap(layer => layer.elements);
    // }
    getAllElements() {
        return [
            ...this.track.elements,
            ...this.blocks.elements,
            ...this.sensors.elements,
            ...this.buildings.elements,
        ];
    }
    getElementAtGrid(x, y) {
        const all = this.getAllElements();
        for (let i = all.length - 1; i >= 0; i--) {
            const el = all[i];
            if (el.x === x && el.y === y) {
                return el;
            }
        }
        return null;
    }
    isOccupied(x, y) {
        return this.getElementAtGrid(x, y) !== null;
    }
    findLayerOfElement(element) {
        return this.layers.find(layer => layer.elements.includes(element));
    }
    getElement(x, y) {
        for (const l of this.layers) {
            for (const e of l.elements) {
                if (e.hitTest(x, y)) {
                    return e;
                }
            }
        }
        return null;
    }
    getLayeredElement(be, x, y) {
        for (const l of this.layers) {
            for (const e of l.elements) {
                if (e.hitTest(x, y) && e.layerName == be.layerName) {
                    return e;
                }
            }
        }
        return null;
    }
    checkElementCollision(e1, e2) {
        const l1 = this.findLayerOfElement(e1);
        const l2 = this.findLayerOfElement(e2);
        console.log("COLLISION: ", l1, l2);
        return l1?.name == l2?.name;
    }
    getElement22(x, y) {
        const layers = [this.track, this.blocks, this.buildings];
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            for (let j = layer.elements.length - 1; j >= 0; j--) {
                const el = layer.elements[j];
                if (el.x === x && el.y === y) {
                    return el;
                }
            }
        }
        return null;
    }
    getElements(x, y) {
        const list = [];
        for (const l of this.layers) {
            for (const e of l.elements) {
                if (e.hitTest(x, y)) {
                    list.push(e);
                }
            }
        }
        return list;
    }
    isExists(x, y) {
        return this.getElements(x, y).length > 0 ? true : false;
    }
    getSelected() {
        for (const l of this.layers) {
            for (const e of l.elements) {
                if (e.selected) {
                    return e;
                }
            }
        }
        return null;
    }
    setSelected(be) {
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
    draw(ctx, options) {
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
    static fromJSON(data) {
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
