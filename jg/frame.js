import { Splitter } from './splitter.js';
import { FrameMenu } from './frame_menu.js';

export class GalleryFrame {
	constructor(args) {
		const { target } = args;
		this.dom = this.populateDom(target);
		this._refreshMenu();
		this._bindDrop();
		this.children = [];
	}

	populateDom(target) {
		const dom = document.createElement('div');
		dom.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);
		dom.classList.add('gFrame');
		dom.control = this;
		target.append(dom);
		return dom;
	}

	_refreshMenu() {
		if ((this.children || []).length && this._menu) {
			this._menu.dispose();
			this._menu = null;
		}
		else {
			this._menu = new FrameMenu({
				target: this.dom,
				commands: [
					{
						action: () => { this.split('row'); },
						icon: 'split-horizontal',
					},
					{
						action: () => { this.split('column'); },
						icon: 'split-vertical',
					},
				],
			});
		}
	}

	_bindDrop() {
		const dom = this.dom;
		dom.ondragenter = (ev) => { ev.preventDefault(); ev.stopPropagation();}
		dom.ondragover = (ev) => { ev.preventDefault(); ev.stopPropagation(); }
		dom.ondrop = function(event) {
			const pic = event.dataTransfer.files[0];
			if (pic) {
				const reader = new FileReader();
				reader.onload = (ev) => this.dom.style.backgroundImage = `url(${ev.target.result})`;
				reader.readAsDataURL(pic);
			}
			event.preventDefault();
			event.stopPropagation();
		}.bind(this);
	}

	/**
	 *
	 * @param direction
	 */
	split(direction = 'row') {
		this.dom.style.flexDirection = direction;
		this.children.push(new GalleryFrame({
			target: this.dom,
		}));
		this.children.push(new Splitter({
			target: this.dom,
			mode: direction,
		}))
		this.children.push(new GalleryFrame({
			target: this.dom,
		}));
		this._refreshMenu();
	}
}