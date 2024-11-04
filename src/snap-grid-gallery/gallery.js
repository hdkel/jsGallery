import {emptyDom, hashCode} from "../utility.js";
import {Frame} from "./frame.js";
import {Splitter} from "./splitter.js";
import {Container} from "./container.js";

export class Gallery {

    static initialDirection = "row";
    static layoutToggle = {'row': 'column', 'column': 'row'};
    static flipDirection = direction => Gallery.layoutToggle[direction];

    constructor(args) {

        // Extract
        const { target } = args;
        this._target = target;

        // Initialize
        this._layout = [];
        this._frames = [];

        // For debugging purpose, consider making optional.
        window.sg = {};
        window.sg.layout = this._layout;
        window.sg.frames = this._frames;

        // Prepare the initial frame
        const initFrame = this._makeFrame();
        this._layout.push(initFrame.id);
        this._frames[initFrame.id] = initFrame;

        // Render
        this._recursiveRender(this._layout, this._target, Gallery.initialDirection);
    }

    _makeFrame() {
        return {
            id:  hashCode(4),
            bgColor: Frame.pickColor(),
        }
    }

    _recursiveRender(layoutElements, target, mode) {

        // If element is an object (array in this case)
        if (Array.isArray(layoutElements)) {

            const container = new Container({target, layoutDirection: mode});
            layoutElements.forEach((element, index) => {

                // Not the first item, meaning we need splitter
                if (index !== 0) {
                    new Splitter({ target: container, layoutDirection: mode});
                }

                // A specific ID, draw frame
                if (typeof element === "string") {
                    const frame = this._frames[element];
                    new Frame({ target: container, gallery: this, ...frame});
                }

                // When it's an object(array), draw container
                else if (Array.isArray(element)) {
                    // Nested containers always have different mode (direction), otherwise they can be in same parent
                    const newDirection = Gallery.flipDirection(mode);
                    this._recursiveRender(element, container, newDirection);
                }
            });
        }
    }

    _findLayoutParentByFrameId(layoutElements, id, direction) {
        for (let i = 0; i < layoutElements.length; i++) {
            let layoutElement = layoutElements[i];

            if (Array.isArray(layoutElement)) {
                const found = this._findLayoutParentByFrameId(layoutElement, id, Gallery.flipDirection(direction));
                if (found) { return found; }
            }
            else if (layoutElement === id) {
                return [layoutElements, direction];
            }
        }
    }

    updateProperties(id, properties) {
        const frame = this._frames[id];
        Object.assign(frame, properties);
    }

    split(id, direction) {
        const [layoutElementParent, existingDirection] = this._findLayoutParentByFrameId(this._layout, id, Gallery.initialDirection);

        // Make the new frame and decide how to append later.
        const newFrame = this._makeFrame();
        this._frames[newFrame.id] = newFrame;

        if (direction === existingDirection) {
            // Same direction, just add to array
            layoutElementParent.splice(layoutElementParent.indexOf(id) + 1, 0, newFrame.id);
        }
        else {
            // Different direction, replace id with an array which contains the id.
            layoutElementParent.splice(layoutElementParent.indexOf(id), 1, [id, newFrame.id]);
        }

        // Layout adjustment is done, let's re-render
        emptyDom(this._target);
        this._recursiveRender(this._layout, this._target, Gallery.initialDirection);
    }
}