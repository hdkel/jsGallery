import { Splitter } from './splitter.js';
import { FrameMenu } from './frame_menu.js';
import {emptyDom, hashCode} from "../utility.js";

export class GalleryFrame {
	constructor(args) {
		const { target, parent, content } = args;
		this.parent = parent;
		this.dom = this.populateDom(target);
		this._refreshMenu();
		this._bindDrop();
		this.setBackground(content);
		this.children = [];
		this._setId();
	}

	_setId() {
		this.id = hashCode(5);
		this.dom.setAttribute('frameId', this.id);
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

			this._menu = new FrameMenu({
				frame: this,
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
				reader.onload = (ev) => this.setBackground(`url(${ev.target.result})`);
				reader.readAsDataURL(pic);
			}
			event.preventDefault();
			event.stopPropagation();
		}.bind(this);
	}

	setBackground(value) {
		this.dom.style.backgroundImage = value;
		this.dom.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);
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
			content: dom.style.backgroundImage, // First child gets parent content.
		}));
		this.children.push(new Splitter({
			parentFrame: this,
			mode: direction,
		}))
		this.children.push(new GalleryFrame({
			target: dom,
			parent: this,
		}));
		this._refreshMenu();
		this.setBackground('none');
	}

	unify(childId) {

	}

	removeSelf() {
		if (this.parent) {
			this.parent.unify(this.id);
		}
	};

	// method that makes button.
	static makeEntry(args) {

		const btnGallery = document.createElement('button');
		btnGallery.innerText = 'JS Gallery';
		btnGallery.onclick = () => {
			emptyDom(args.target);
			window.history.pushState({}, 'JS Gallery', '/gallery');
			new GalleryFrame({
				target: args.target
			});
		}

		return btnGallery;
	}
}