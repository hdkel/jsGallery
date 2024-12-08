import {emptyDom} from "../utility.js";
import {Frame} from "./frame.js";
import {Container} from "./container.js";

/**
 * Gallery app that allows freely split and rearrange the viewport.
 */
export class Gallery {

    constructor(args) {

        // Extract
        const { target } = args;
        this._target = target;

        // Initialize
        this._layout = {};
        this._frameNodes = [];

        // For debugging purpose, consider making optional.
        window.sg = {};
        window.sg.layout = this._layout;
        window.sg.frames = this._frameNodes;

        // Prepare the initial frame
        const initNode = Frame.generatePropertyNode();
        this._frameNodes[initNode.id] = initNode;
        this._layout = Frame.generateLayoutNode(initNode.id);

        // Mid-step properties
        this.dragFrameId = null;

        // Render
        this._render();
        this._bindEventHandlers();
    }

    _bindEventHandlers() {
        this._boundMouseMove = this._handleMouseMove.bind(this);
        this._boundMouseUp = this._handleMouseUp.bind(this);
        this._target.addEventListener("mouseup", this._boundMouseUp);
    }
    _handleMouseMove(event) {
        const frameClass = event.target.class;
        if (frameClass?.nodeType === 'frame') {
            frameClass.handleSplitDrag(event);
        }
    }
    _handleMouseUp() {
        const frameClass = event.target.class;
        if (frameClass?.nodeType === 'frame') {
            frameClass.endSplitDrag();
        }
    }

    getFramePropertyNodeById(id) {
        return this._frameNodes[id];
    }

    _organizeLayout(layoutNode) {

        let hasChange = false;
        if (layoutNode.type === 'container') {

            // Container with only one container as child, should flatten
            if (layoutNode.nodes.length === 1) {

                if (layoutNode.nodes[0].type === 'container') {
                    const childNode = layoutNode.nodes[0];
                    layoutNode.direction = childNode.direction;
                    layoutNode.nodes = childNode.nodes;
                    hasChange = true;
                }
                else if (layoutNode.nodes[0].type === 'frame') {
                    layoutNode.type = 'frame';
                    layoutNode.id = layoutNode.nodes[0].id;
                    delete layoutNode.dom;
                    delete layoutNode.nodes;
                    delete layoutNode.direction;
                    hasChange = true;
                }
            }

            // Container with multiple children, do recursive
            else if (layoutNode.nodes.length > 1){
                for (let i = 0; i < layoutNode.nodes.length; i++) {
                    let childNode = layoutNode.nodes[i];
                    if (childNode.type === 'container') {
                        this._organizeLayout(childNode);
                    }
                }
            }
        }

        // Has data change, we need to rerun this.
        if (hasChange) {
            this._organizeLayout(layoutNode);
        }

        // No data change at this layer, do one more loop so frames with same direction at this level are not nested.
        else if (layoutNode.type === 'container') {
            for (let i = 0; i < layoutNode.nodes.length; i++) {
                let childNode = layoutNode.nodes[i];
                if (childNode.type === 'container' && childNode.direction === layoutNode.direction) {
                    layoutNode.nodes.splice(i, 1, ...childNode.nodes);
                }
            }
        }
    }

    // This method, and all subcomponents, only deals with UI update.
    // ABSOLUTELY NO data manipulation on this._layout or this._framesNodes is allowed from inside.
    _render() {
        console.log(this._layout);
        emptyDom(this._target);
        if (this._layout.type === 'container') {
            new Container({target: this._target, gallery: this, layoutNode: this._layout});
        }
        else if (this._layout.type === 'frame') {
            new Frame({ target: this._target, gallery: this, layoutNode: this._layout, canRemove: false });
        }

        // Everything has bene created and properly sized, now to render each frame under their new dimension
        this._layout.class.render();
    }

    _findParentContainerNodeByFrameId(layoutNode, id) {
        if (layoutNode.type === 'container') {
            for (let i = 0; i < layoutNode.nodes.length; i++) {
                let childNode = layoutNode.nodes[i];

                if (childNode.type === 'container') {
                    const found = this._findParentContainerNodeByFrameId(childNode, id, layoutNode.direction);
                    if (found) { return found; }
                }
                else if (childNode.type === 'frame' && childNode.id === id) {
                    return layoutNode;
                }
            }
        }
    }

    updateFrameProperties(id, properties) {
        const frame = this._frameNodes[id];
        Object.assign(frame, properties);
    }

    split(child, splitDirection) {
        let layoutElementParent = this._findParentContainerNodeByFrameId(this._layout, child.id);
        if (!layoutElementParent) {
            layoutElementParent = Container.generateLayoutNode(splitDirection, [child]);
            this._layout = layoutElementParent;
        }

        // Make the new frame and decide how to append later.
        const newFrame = Frame.generatePropertyNode();
        this._frameNodes[newFrame.id] = newFrame;

        if (splitDirection === layoutElementParent.direction) {
            // Same direction, just add to array
            const index = layoutElementParent.nodes.indexOf(child) + 1;
            layoutElementParent.nodes.splice(index, 0, Frame.generateLayoutNode(newFrame.id));
        }
        else {
            // Different direction, replace id with a new frame object with two ids as nodes.
            const index = layoutElementParent.nodes.indexOf(child);
            const newChildNodes = [Frame.generateLayoutNode(child.id), Frame.generateLayoutNode(newFrame.id)];
            const newContainer = Container.generateLayoutNode(splitDirection, newChildNodes);
            layoutElementParent.nodes.splice(index, 1, newContainer);
        }

        // Layout adjustment is done, update debug value and  re-render
        window.sg.layout = this._layout;
        this._render();
    }

    removeFrame(id) {
        const layoutElementParent = this._findParentContainerNodeByFrameId(this._layout, id);

        const frameElement = layoutElementParent.nodes.find(node => node.id === id);
        layoutElementParent.nodes.splice(layoutElementParent.nodes.indexOf(frameElement), 1);
        delete this._frameNodes[id];

        this._organizeLayout(this._layout);
        window.sg.layout = this._layout;
        this._render();
    }

    setDragFrameId(id = null) {
        this.dragFrameId = id;
        if (id) {
            document.addEventListener('mousemove', this._boundMouseMove);
        } else {
            document.removeEventListener('mousemove', this._boundMouseMove);
        }
    }

    setFrameSplit(id, direction) {
        const splitSourceFrameId = this.dragFrameId;
        const splitTargetFrameId = id;
        const splitDirection = direction;

        // Dropping on same frame, do nothing.
        if (splitSourceFrameId === splitTargetFrameId) {
            this.dragFrameId = null;
            return;
        }
        else {

            // Find the parent - no need for null check because if there's only one frame, you won't be able to drop it on itself.
            const targetLayoutElementParent = this._findParentContainerNodeByFrameId(this._layout, splitTargetFrameId);
            const sourceLayoutElementParent = this._findParentContainerNodeByFrameId(this._layout, splitSourceFrameId);

            // Gets layoutNodes for source and target frame from of each parents
            const sourceFrameLayoutNode = sourceLayoutElementParent.nodes.find(layoutNode => layoutNode.id === splitSourceFrameId);
            const targetFrameLayoutNode = targetLayoutElementParent.nodes.find(layoutNode => layoutNode.id === splitTargetFrameId);

            // Remove source from its old parent
            const indexToRemove = sourceLayoutElementParent.nodes.indexOf(sourceFrameLayoutNode);
            sourceLayoutElementParent.nodes.splice(indexToRemove, 1);

            // check split direction to decide child frame order
            const isInsertBefore = ["left", "top"].includes(splitDirection);

            // Split along same direction of target frame (vertical or horizontal, same logic)
            if ((["left", "right"].includes(splitDirection) && targetLayoutElementParent.direction === "row") ||
                (["top", "bottom"].includes(splitDirection) && targetLayoutElementParent.direction === "column")
            ) {
                // Append to new parent, which is the container for target frame
                const indexToInsert = targetLayoutElementParent.nodes.indexOf(targetFrameLayoutNode);
                targetLayoutElementParent.nodes.splice(isInsertBefore ? indexToInsert : indexToInsert + 1, 0, sourceFrameLayoutNode);
            }

            // When split directions are different
            else {

                // Prepares a new container
                const newContainerDirection = Container.getOtherDirection(targetLayoutElementParent.direction);
                const newChildNodes = isInsertBefore ? [sourceFrameLayoutNode, targetFrameLayoutNode] : [targetFrameLayoutNode, sourceFrameLayoutNode];

                // Nest target frame into container, and put container into target's parent
                const indexToInsert = targetLayoutElementParent.nodes.indexOf(targetFrameLayoutNode);
                targetLayoutElementParent.nodes.splice(indexToInsert, 1, Container.generateLayoutNode(newContainerDirection, newChildNodes));
            }
        }

        this.dragFrameId = null;
        this._organizeLayout(this._layout);
        window.sg.layout = this._layout;
        this._render();
    }
}