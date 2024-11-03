export class Splitter {
	constructor(args) {
		const { target, mode } = args;
		this.dom = this.populateDom(target, mode);
	}

	populateDom(target, mode) {
		const dom = document.createElement('div');
		dom.classList.add('gResizer');
		dom.classList.add(mode === 'row' ? 'gResizer-alongHorizontal' : 'gResizer-alongVertical');
		dom.control = this;
		target.append(dom);
		return dom;
	}
}