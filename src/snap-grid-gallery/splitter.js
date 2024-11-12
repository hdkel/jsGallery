export class Splitter {

	static mapDirectionToCss = {'row': 'gResizer-alongHorizontal', 'column': 'gResizer-alongVertical'};
	static directionToCss = direction => Splitter.mapDirectionToCss[direction] || 'gResizer-alongVertical';

	constructor(args) {
		const { target, layoutDirection } = args;
		this._domElement = this._createDomElement(target, layoutDirection);
	}

	_createDomElement(target, layoutDirection) {
		const dom = document.createElement('div');
		dom.class = this;
		dom.classList.add('gResizer');
		dom.classList.add(Splitter.directionToCss(layoutDirection));

		target.append(dom);
		return dom;
	}
}