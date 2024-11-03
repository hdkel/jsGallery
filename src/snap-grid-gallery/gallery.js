import {emptyDom, hashCode} from "../utility.js";
import {Frame} from "./frame.js";
import {Splitter} from "./splitter.js";
import {Container} from "./container.js";

export class Gallery {

    constructor(args) {
        const { target } = args;
        this._target = target;
        this._layout = [];
        this._frames = [];
        this._startDirection = "row";
        this._initFrameData();
        this._recursiveRender(this._layout, this._target, this._startDirection);
    }

    _initFrameData() {

        window.sg = {};
        window.sg.layout = this._layout;
        window.sg.frames = this._frames;

        for (let i = 0; i < 2; i++) {
            const id = hashCode(4);
            const frame = {
                id,
                bgColor: Frame.pickColor(),
            };
            this._layout.push(id);
            this._frames[id] = frame;
        }

        const ct = [];
        for (let i = 0; i < 2; i++) {
            const id = hashCode(4);
            const frame = {
                id,
                bgColor: Frame.pickColor(),
            };
            ct.push(id);
            this._frames[id] = frame;
        }
        this._layout.push(ct);
    }

    _recursiveRender(layoutElements, target, mode) {

        if (typeof layoutElements === "object") {

            const container = new Container({target, mode});
            layoutElements.forEach((element, index) => {

                // Not the first item, meaning we need splitter
                if (index !== 0) {
                    new Splitter({ target: container, mode});
                }

                // A specific ID, draw frame
                if (typeof element === "string") {
                    const frame = this._frames[element];
                    new Frame({ target: container, gallery: this, ...frame});
                }

                // When it's an object(array), draw container
                else if (typeof element === "object") {
                    // Nested containers always have different mode (direction), otherwise they can be in same parent
                    const newDirection = this.flipDirection(mode);
                    this._recursiveRender(element, container, newDirection);
                }
            });
        }
    }

    flipDirection(direction) {
        return direction === 'row' ? 'column' : 'row';
    }

    split(id, direction) {
        const [layoutElementParent, existingDirection] = this.findLayoutParentByFrameId(this._layout, id, this._startDirection);

        // Make the new frame and decide how to append later.
        const idNew = hashCode(4);
        this._frames[idNew] = {
            id: idNew,
            bgColor: Frame.pickColor(),
        };

        if (direction === existingDirection) {
            layoutElementParent.splice(layoutElementParent.indexOf(id) + 1, 0, idNew);
        }
        else {
            layoutElementParent.splice(layoutElementParent.indexOf(id), 1, [id, idNew]);
        }

        // Adjustment of layout is done, let's re-render
        emptyDom(this._target);
        this._recursiveRender(this._layout, this._target, "row");
    }

    findLayoutParentByFrameId(layoutElements, id, direction) {

        for (let i = 0; i < layoutElements.length; i++) {
            let layoutElement = layoutElements[i];
            if (typeof layoutElement === "object") {
                const found = this.findLayoutParentByFrameId(layoutElement, id, this.flipDirection(direction));
                if (found) { return found; }
            }
            else if (layoutElement === id) {
                return [layoutElements, direction];
            }
        }
    }
}