export class Splitter {
	constructor(args) {
		const { target, mode } = args;
		this.dom = this.populateDom(target);
	}

	populateDom(target) {
		const dom = document.createElement('div');
		dom.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);
		dom.classList.add('gResizer');
		dom.control = this;
		target.append(dom);
		return dom;
	}

}