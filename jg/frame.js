import { Splitter } from './splitter.js';
import { FrameMenu } from './frame_menu.js';

export class GalleryFrame {
	constructor(args) {
		const { target, parent, content } = args;
		this.parent = parent;
		this.dom = this.populateDom(target);
		this._refreshMenu();
		this._bindDrop();
		this._setBackground(content);
		this.children = [];
	}

	populateDom(target) {
		const dom = document.createElement('div');
		dom.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);
		dom.classList.add('gFrame');
		target.append(dom);
		return dom;
	}

	_refreshMenu() {
		if ((this.children || []).length && this._menu) {
			this._menu.dispose();
			this._menu = null;
		}
		else {
			const commands = [
				{
					action: () => { this.split('row'); },
					icon: 'split-horizontal',
				},
				{
					action: () => { this.split('column'); },
					icon: 'split-vertical',
				},
				{
					action: () => { this._setBackground('none'); },
					icon: 'reload',
				},
			];
			// if (this.parent) {
			// 	commands.push({
			// 		action: () => { this._dispose(); },
			// 		icon: 'remove',
			// 	});
			// }

			this._menu = new FrameMenu({
				target: this.dom,
				commands,
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
				reader.onload = (ev) => this._setBackground(`url(${ev.target.result})`);
				reader.readAsDataURL(pic);
			}
			event.preventDefault();
			event.stopPropagation();
		}.bind(this);
	}

	_setBackground(value) {
		this.dom.style.backgroundImage = value;
	}

	/**
	 *
	 * @param direction
	 */
	split(direction = 'row') {
		const dom = this.dom;
		dom.style.flexDirection = direction;
		this.children.push(new GalleryFrame({
			target: dom,
			parent: this,
			content: dom.style.backgroundImage,
		}));
		this.children.push(new Splitter({
			target: dom,
			mode: direction,
		}))
		this.children.push(new GalleryFrame({
			target: dom,
			parent: this,
		}));
		this._refreshMenu();
		this._setBackground('none');
	}

	_dispose() {
		// TODO: best way to remove?
		this.parent.trimChild()
	}
}