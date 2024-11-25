export class FrameMenu {

	static mapSvgUrl = {
		'split-horizontal': 'src/assets/icon-split-horizontal.svg',
		'split-vertical': 'src/assets/icon-split-vertical.svg',
		'remove': 'src/assets/icon-close.svg',
		'reload': 'src/assets/icon-unload.svg',
	}
	static commandToSvgUrl = icon => FrameMenu.mapSvgUrl[icon] || null;

	constructor(args) {
		const { target, frame, canRemove } = args;
		this._frame = frame;
		this._canRemove = canRemove;

		this._domElement = this._createDomElement(target);
		this._appendButtons();
	}

	_createDomElement(target) {
		const menu = document.createElement('div');
		menu.class = this;
		menu.classList.add('gMenu2');

		target.append(menu);
		return menu;
	}

	_appendButtons() {

		if (this._canRemove) {
			this._domElement.append(this._createButton({
				action: () => { this._frame.removeSelf(); },
				icon: 'remove',
			}));
		}

		[
			{
				action: () => { this._frame.setBackground(null); },
				icon: 'reload',
			},
			{
				action: () => { this._frame.split('row'); },
				icon: 'split-horizontal',
			},
			{
				action: () => { this._frame.split('column'); },
				icon: 'split-vertical',
			}
		].forEach((command) => {
			this._domElement.append(this._createButton(command));
		});
	}

	_createButton(command) {
		const button = document.createElement('div');
		button.style.backgroundImage = `url(${FrameMenu.commandToSvgUrl(command.icon)})`;
		button.onclick = command.action;
		button.classList.add('gMenuButton');
		return button;
	}
}