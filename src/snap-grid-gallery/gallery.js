import {hashCode} from "../utility.js";
import {Frame} from "./frame.js";
import {Splitter} from "./splitter.js";
import {Container} from "./container.js";

export class Gallery {

    constructor(args) {
        const { target } = args;
        this._target = target;
        this._layout = [];
        this._frames = [];
        this._initFrameData();
        this._render(this._layout, this._target, "row");
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

    _render(layoutElements, target, mode) {

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
                    new Frame({ target: container, ...frame});
                }

                // When it's an object(array), draw container
                else if (typeof element === "object") {
                    // Nested containers always have different mode (direction), otherwise they can be in same parent
                    const newDirection = this.flipDirection(mode);
                    this._render(element, container, newDirection);
                }
            });
        }
    }

    flipDirection(direction) {
        return direction === 'row' ? 'column' : 'row';
    }
}