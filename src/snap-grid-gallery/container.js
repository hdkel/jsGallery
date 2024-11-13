import {Splitter} from "./splitter.js";
import {Frame} from "./frame.js";

export class Container {

    static mapDirectionToCss = {'row': 'gContainer-horizontal', 'column': 'gContainer-vertical'};
    static directionToCss = direction => Container.mapDirectionToCss[direction] || 'gContainer-horizontal';
    static generateLayoutNode = (direction, nodes) => ({ type: 'container', direction, nodes });

    constructor(args) {

        // Extract
        const { target, gallery, layoutNode } = args;
        this._layoutNode = layoutNode;
        this._gallery = gallery;

        // Create DOM elements
        this._layoutNode.dom = this._domElement = this._createDomElement(target);
        this._createChildDomElements();
        this._layoutNode.class = this;
    }

    _createDomElement(target) {
        const dom = document.createElement('div');
        dom.class = this;
        dom.classList.add('gContainer');
        dom.classList.add(Container.directionToCss(this._layoutNode.direction));

        target.append(dom);
        return dom;
    }

    _createChildDomElements() {
        this._layoutNode.nodes.forEach((layoutNode, index) => {

            // Not the first item, meaning we need splitter
            if (index !== 0) {
                new Splitter({ target: this._domElement, layoutDirection: this._layoutNode.direction});
            }

            switch (layoutNode.type) {
                case 'frame':
                    new Frame({ target: this._domElement, gallery: this._gallery, layoutNode: layoutNode });
                    break;
                case 'container':
                    new Container({target: this._domElement, gallery: this._gallery, layoutNode: layoutNode });
                    break;
                default:
                    return;
            }
        });
    }

    render() {
        this._layoutNode.nodes.forEach((childNode) => {
            childNode.class.render();
        })
    }
}