export class Layer {
    id;
    name;
    visible;
    locked;
    elements;
    constructor(id, name, options) {
        this.id = id;
        this.name = name;
        this.visible = options?.visible ?? true;
        this.locked = options?.locked ?? false;
        this.elements = [];
    }
    add(element) {
        this.elements.push(element);
    }
    remove(element) {
        this.elements = this.elements.filter(e => e !== element);
    }
    clear() {
        this.elements = [];
    }
    draw(ctx, options) {
        this.elements.forEach(e => e.draw(ctx, options));
    }
    hitTest(x, y) {
        this.elements.forEach((e) => {
            if (e.hitTest(x, y)) {
                return true;
            }
        });
        return false;
    }
}
