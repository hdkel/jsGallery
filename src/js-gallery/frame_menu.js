export class FrameMenu {
	constructor(args) {
		const { frame } = args;
		this.dom = this.populateDom(frame.dom);
		this._createButtons(frame);
	}

	populateDom(target) {
		const menu = document.createElement('div');
		menu.classList.add('gMenu');
		target.append(menu);
		return menu;
	}

	/**
	 *
	 * @param {GalleryFrame} frame
	 * @private
	 */
	_createButtons(frame) {
		[
			{
				action: () => { frame.split('row'); },
				icon: 'split-horizontal',
			},
			{
				action: () => { frame.split('column'); },
				icon: 'split-vertical',
			},
			{
				action: () => { frame.setBackground('none'); },
				icon: 'reload',
			},
		].forEach((command) => {
			const button = document.createElement('div');
			button.textContent = this._decideIcon(command);
			button.onclick = command.action;
			button.classList.add('gMenuButton');
			this.dom.append(button);
		});
	}

	_decideIcon(command) {
		let icon = '';
		switch (command.icon) {
			case 'split-horizontal':
				icon = '\uD83C\uDC39';
				break;
			case 'split-vertical':
				icon = '\uD83C\uDC6B';
				break;
			case 'remove':
				icon = "\u2715";
				break;
			case 'reload':
				icon = '\u27f3';
				break;
			default:
				icon = '?';
				break;
		}
		return icon;
	}

	dispose() {
		this.dom.remove();
		return this.dom;
	}
}