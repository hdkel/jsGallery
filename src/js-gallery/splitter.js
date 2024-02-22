export class Splitter {
	constructor(args) {
		const { parentFrame, mode } = args;
		this.dom = this.populateDom(parentFrame.dom, mode);
		this._bindDrag(parentFrame);
	}

	populateDom(target, mode) {
		const dom = document.createElement('div');
		dom.classList.add('gResizer');
		dom.classList.add(mode === 'row' ? 'gResizer-vertical' : 'gResizer-horizontal');
		dom.draggable = true;
		dom.control = this;
		target.append(dom);
		return dom;
	}

	_bindDrag(parentFrame) {
		this.dom.ondragstart = (event) => {
			parentFrame.isResizing = true;
			console.log(event.y, parentFrame.isResizing);
		};
	}
}