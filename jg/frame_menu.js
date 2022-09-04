export class FrameMenu {
	constructor(args) {
		const { target, commands } = args;
		this.dom = this.populateDom(target);
		this._createButtons(commands);
	}

	populateDom(target) {
		const menu = document.createElement('div');
		menu.classList.add('gMenu');
		target.append(menu);
		return menu;
	}

	/**
	 *
	 * @param {Object[]} commands
	 * @private
	 */
	_createButtons(commands) {
		commands.forEach((command) => {
			this._createButton(command);
		});
	}

	_createButton(command) {

		const button = document.createElement('div');
		button.textContent = '='
		button.onclick = command.action;
		button.classList.add('gMenuButton');
		if (command.icon === 'split-horizontal') {
			button.style.transform = "rotate(90deg)";
		}
		this.dom.append(button);
	}

	dispose() {
		this.dom.remove();
		return this.dom;
	}
}