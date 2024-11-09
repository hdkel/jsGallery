import {Splitter} from "./splitter.js";
import {Frame} from "./frame.js";

export class Container {

    static mapDirectionToCss = {'row': 'gContainer-horizontal', 'column': 'gContainer-vertical'};
    static directionToCss = direction => Container.mapDirectionToCss[direction] || 'gContainer-horizontal';
    static generateLayoutNode = (direction, nodes) => ({ type: 'container', direction, nodes });

    constructor(args) {

        // Extract
        const { target, gallery, layout } = args;
        this._layout = layout;
        this._gallery = gallery;

        // Create DOM element
        this._domElement = this._createDomElement();
        this._domElement.class = this;
        this._layout.dom = this._domElement;
        target.append(this._domElement);

        this._createChildDomElements();

        // Return for outside world
        return this._domElement;
    }

    _createDomElement() {
        const dom = document.createElement('div');
        dom.classList.add('gContainer');
        dom.classList.add(Container.directionToCss(this._layout.direction));
        return dom;
    }

    _createChildDomElements() {
        this._layout.nodes.forEach((node, index) => {

            // Not the first item, meaning we need splitter
            if (index !== 0) {
                new Splitter({ target: this._domElement, layoutDirection: this._layout.direction});
            }

            switch (node.type) {
                case 'frame':
                    new Frame({ target: this._domElement, gallery: this._gallery, node, canRemove: this._layout.nodes.length > 1 });
                    break;
                case 'container':
                    new Container({target: this._domElement, gallery: this._gallery, layout: node });
                    break;
                default:
                    return;
            }
        });
    }
}