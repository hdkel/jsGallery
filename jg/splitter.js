export class Splitter {
	constructor(args) {
		const { target, mode } = args;
		this.dom = this.populateDom(target);
	}

	populateDom(target) {
		const dom = document.createElement('div');
		dom.classList.add('gResizer');
		dom.control = this;
		target.append(dom);
		return dom;
	}

}