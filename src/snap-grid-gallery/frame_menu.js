export class FrameMenu {

	static mapIcon = {
		'split-horizontal': '\uD83C\uDC39',
		'split-vertical': '\uD83C\uDC6B',
		'remove': '\u2715',
		'reload': '\u27f3',
	};
	static commandToIcon = icon => FrameMenu.mapIcon[icon] || '?';

	constructor(args) {
		const { target, frame } = args;
		this._frame = frame;

		// Makes DOM element.
		this._domElement = this._createDomElement(target);
		this._domElement.class = this;
		target.append(this._domElement);

		// and buttons
		this._appendButtons();
	}

	_createDomElement() {
		const menu = document.createElement('div');
		menu.classList.add('gMenu2');
		return menu;
	}

	_appendButtons() {
		[
			{
				action: () => { this._frame.split('row'); },
				icon: 'split-horizontal',
			},
			{
				action: () => { this._frame.split('column'); },
				icon: 'split-vertical',
			},
			{
				action: () => { this._frame.setBackground('none'); },
				icon: 'reload',
			},
			{
				action: () => { this._frame.removeSelf(); },
				icon: 'remove',
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

	dispose() {
		this._domElement.remove();
		return this._domElement;
	}
}