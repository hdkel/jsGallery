export class FrameMenu {

	static mapIcon = {
		'split-horizontal': '\uD83C\uDC39',
		'split-vertical': '\uD83C\uDC6B',
		'remove': '\u2179',
		'reload': '\u27f3',
	};
	static commandToIcon = icon => FrameMenu.mapIcon[icon] || '?';

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
		button.textContent = FrameMenu.commandToIcon(command.icon);
		button.onclick = command.action;
		button.classList.add('gMenuButton');
		return button;
	}
}