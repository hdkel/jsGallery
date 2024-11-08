import {emptyDom, hashCode} from "../utility.js";
import {Frame} from "./frame.js";
import {Container} from "./container.js";

export class Gallery {

    static initialDirection = "row";

    constructor(args) {

        // Extract
        const { target } = args;
        this._target = target;

        // Initialize
        this._layout = {};
        this._frames = [];

        // For debugging purpose, consider making optional.
        window.sg = {};
        window.sg.layout = this._layout;
        window.sg.frames = this._frames;

        // Prepare the initial frame
        const initFrame = this._makeFrame();
        this._frames[initFrame.id] = initFrame;
        this._layout = this._makeNodeContainer(Gallery.initialDirection, [this._makeNodeFrame(initFrame.id)]);

        // Render
        this._render(this._layout, this._target, Gallery.initialDirection);
    }

    getFrameById(id) {
        return this._frames[id];
    }

    _makeNodeContainer(direction, nodes) {
        return { type: 'container', direction, nodes }
    }

    _makeNodeFrame(id) {
        return { type: 'frame', id }
    }

    _makeFrame() {
        return {
            id:  hashCode(4),
            bgColor: Frame.pickColor(),
        }
    }

    // This method, and all subcomponents, only deals with UI update.
    // ABSOLUTELY NO data manipulation on this._layout or this._frames is allowed from inside.
    _render(layout, target) {
        console.log(this._layout);
        emptyDom(this._target);
        new Container({target, gallery: this, layout});
    }

    _findLayoutParentByFrameId(layoutElement, id) {
        for (let i = 0; i < layoutElement.nodes.length; i++) {
            let child = layoutElement.nodes[i];

            if (child.type === 'container') {
                const found = this._findLayoutParentByFrameId(child, id, layoutElement.direction);
                if (found) { return found; }
            }
            else if (child.type === 'frame' && child.id === id) {
                return layoutElement;
            }
        }
    }

    updateFrameProperties(id, properties) {
        const frame = this._frames[id];
        Object.assign(frame, properties);
    }

    split(child, splitDirection) {
        const layoutElementParent = this._findLayoutParentByFrameId(this._layout, child.id);

        // Make the new frame and decide how to append later.
        const newFrame = this._makeFrame();
        this._frames[newFrame.id] = newFrame;

        if (splitDirection === layoutElementParent.direction) {
            // Same direction, just add to array
            const index = layoutElementParent.nodes.indexOf(child) + 1;
            layoutElementParent.nodes.splice(index, 0, this._makeNodeFrame(newFrame.id));
        }
        else {
            // Different direction, replace id with a new frame object with two ids as nodes.
            const index = layoutElementParent.nodes.indexOf(child);
            const newChildNodes = [this._makeNodeFrame(child.id), this._makeNodeFrame(newFrame.id)];
            const newContainer = this._makeNodeContainer(splitDirection, newChildNodes);
            layoutElementParent.nodes.splice(index, 1, newContainer);
        }

        // Layout adjustment is done, let's re-render
        this._render(this._layout, this._target);
    }

    removeFrame(id) {

        const layoutElementParent = this._findLayoutParentByFrameId(this._layout, id);

        const frameElement = layoutElementParent.nodes.find(node => node.id === id);
        const index = layoutElementParent.nodes.indexOf(frameElement);
        layoutElementParent.nodes.splice(index, 1);

        if (layoutElementParent.nodes.length === 1) {
            const remainingNode = layoutElementParent.nodes[0];

            if (remainingNode.type === 'frame') {
                layoutElementParent.type = 'frame';
                layoutElementParent.id = remainingNode.id;
                delete layoutElementParent.nodes;
                delete layoutElementParent.direction;
            }
            else if (remainingNode.type === 'container') {
                layoutElementParent.direction = remainingNode.direction;
                layoutElementParent.nodes = remainingNode.nodes;
                // todo: this is not enough, youcould have [1, [2,3]] 3 columns in same container
            }
        }

        delete this._frames[id];
        this._render(this._layout, this._target);
    }
}