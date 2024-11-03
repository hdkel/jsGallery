export class FrameMenu {
	constructor(args) {
		const { target, frame } = args;
		this.frame = frame;
		this.dom = this.populateDom(target);
		this._createButtons();
	}

	populateDom(target) {
		const menu = document.createElement('div');
		menu.classList.add('gMenu2');
		target.append(menu);
		return menu;
	}

	_createButtons() {
		[
			{
				action: () => { this.frame.split('row'); },
				icon: 'split-horizontal',
			},
			{
				action: () => { this.frame.split('column'); },
				icon: 'split-vertical',
			},
			{
				action: () => { this.frame.setBackground('none'); },
				icon: 'reload',
			},
			{
				action: () => { this.frame.removeSelf(); },
				icon: 'remove',
			}
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