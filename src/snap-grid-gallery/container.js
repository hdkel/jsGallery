export class Container {

    static mapDirectionToCss = {'row': 'gContainer-horizontal', 'column': 'gContainer-vertical'};
    static directionToCss = direction => Container.mapDirectionToCss[direction] || 'gContainer-horizontal';

    constructor(args) {

        // Extract
        const { target, layoutDirection } = args;

        // Create DOM element
        this._domElement = this._createDomElement(layoutDirection);
        this._domElement.class = this;
        target.append(this._domElement);

        // Return for outside world
        return this._domElement;
    }

    _createDomElement(layoutDirection) {
        const dom = document.createElement('div');
        dom.classList.add('gContainer');
        dom.classList.add(Container.directionToCss(layoutDirection));
        return dom;
    }
}