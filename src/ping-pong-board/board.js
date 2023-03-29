import { emptyDom } from "../utility.js";

export class PingPongBoard {

	constructor(args) {
		const { target } = args;

		this._gamesTotal = 3;
		this._scoreWin = 11;
		this._colors = ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'];
		this._fullGameScore = [];

		// Left - rival, right - player
		this._scoreLeft = this._createScoreBoard(this._popColor(), 'left');
		target.append(this._scoreLeft);
		this._scoreRight = this._createScoreBoard(this._popColor(), 'right');
		target.append(this._scoreRight);

		// The bar to show the full game score
		this._roundBar = this._createRoundBoard();
		target.append(this._roundBar);

		// Binds all events
		this._bindEvents();
	}

	// Creates a score board (with a random color) for one player
	_createScoreBoard(color, player) {

		const Score = document.createElement('div');
		Score.style.backgroundColor = color;
		Score.innerText = "0";
		Score.classList.add('score');

		const addScore = () => {
			const currentScore = Number(Score.innerText);
			Score.innerText = String(Math.min(Number(currentScore) + 1, this._scoreWin));
			if (currentScore === this._scoreWin - 1) {
				// trigger an event to notify class that a player has won a round
				const event = new CustomEvent('_playerWon', { detail: { player } });
				document.dispatchEvent(event);
			}
		};
		const reduceScore = () => { Score.innerText = String(Math.max(Number(Score.innerText) - 1, 0)); };
		const clearScore = () => { Score.innerText = "0"; };

		Score.addScore = addScore;
		Score.clearScore = clearScore;

		Score.addEventListener('click', addScore);
		Score.addEventListener('contextmenu', (e) => {	e.preventDefault(); reduceScore(); });

		return Score;
	}

	// Creates a bar to show how many rounds each player has won
	_createRoundBoard() {
		const roundBar = document.createElement('div');
		roundBar.classList.add('round-bar');
		for (let i = 0; i < this._gamesTotal; i++) {
			const round = document.createElement('div');
			round.classList.add('round-bar-item');
			roundBar.append(round);
		}
		return roundBar;
	}

	// Binds all keyboard events
	_bindEvents() {

		// Keypress to increase / decrease or reset score
		document.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') { this._scoreLeft.addScore(); }
			else if (e.key === 'ArrowRight') { this._scoreRight.addScore(); }
			else if (e.key === "Escape") {
				this._scoreLeft.clearScore();
				this._scoreRight.clearScore();
			}
		});

		// listen for playerWon event
		document.addEventListener('_playerWon', () => {
			this._fullGameScore.push(this._getRoundScore());
			const event = new CustomEvent('updateRoundBar');
			document.dispatchEvent(event);
		});

		// listen for updateRoundBar event
		document.addEventListener('updateRoundBar', () => {

			if (this._fullGameScore.length <= this._gamesTotal) {

				const colorLeft = this._scoreLeft.style.backgroundColor;
				const colorRight = this._scoreRight.style.backgroundColor;
				const roundBarItems = this._roundBar.getElementsByClassName('round-bar-item');
				let indexItemLeft = 0;
				let indexItemRight = roundBarItems.length - 1;

				this._fullGameScore.forEach((score) => {

					// Left has won
					if (score[0] > score[1]) {
						const roundBarItem = roundBarItems[indexItemLeft];
						roundBarItem.style.backgroundColor = colorLeft;
						roundBarItem.innerText = `${score[0]} - ${score[1]}`;
						indexItemLeft++;
					}

					// Right has won
					else {
						const roundBarItem = roundBarItems[indexItemRight];
						roundBarItem.style.backgroundColor = colorRight;
						roundBarItem.innerText = `${score[0]} - ${score[1]}`;
						indexItemRight--;
					}
				});
			}
		});
	}

	// This method reads DOM and gets current score displayed on the page.
	_getRoundScore() {
		return [Number(this._scoreLeft.innerText), Number(this._scoreRight.innerText)];
	}

	// Pops a random color from the color array
	_popColor() {
		const pickedColor = this._colors[Math.floor(Math.random() * this._colors.length)];
		this._colors = this._colors.filter((color) => color !== pickedColor);
		return pickedColor;
	}

	// method that makes button.
	static makeEntry(args) {

		const btnScoreBoard = document.createElement('button');
		btnScoreBoard.innerText = 'Ping Pong Score Board';
		btnScoreBoard.onclick = () => {
			emptyDom(args.target);
			window.history.pushState({}, 'Ping Pong Score Board', '/board');
			new PingPongBoard({
				target: args.target
			});
		}

		return btnScoreBoard;
	}
}