export class Splitter {

	static mapDirectionToCss = {'row': 'gResizer-alongHorizontal', 'column': 'gResizer-alongVertical'};
	static directionToCss = direction => Splitter.mapDirectionToCss[direction] || 'gResizer-alongVertical';

	constructor(args) {
		const { target, layoutDirection } = args;

		// Create DOM element
		this._domElement = this._createDomElement(target, layoutDirection);
		this._domElement.class = this;
		target.append(this._domElement);
	}

	_createDomElement(target, layoutDirection) {
		const dom = document.createElement('div');
		dom.classList.add('gResizer');
		dom.classList.add(Splitter.directionToCss(layoutDirection));
		return dom;
	}
}