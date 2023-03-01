export class PingPongBoard {
	constructor(args) {
		const { target } = args;
		this._gamesTotal = 3;
		this._scoreWin = 21;
		this._colors = ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'];
		this._fullGameScore = {
			left: 0,
			right: 0
		};

		this._scoreLeft = this._createScore(this._popColor(), 'left');
		target.append(this._scoreLeft);

		this._scoreRight = this._createScore(this._popColor(), 'right');
		target.append(this._scoreRight);

		// The bar to show the full game score
		this._roundBar = document.createElement('div');
		this._roundBar.classList.add('round-bar');
		for (let i = 0; i < this._gamesTotal; i++) {
			const round = document.createElement('div');
			round.classList.add('round-bar-item');
			this._roundBar.append(round);
		}
		target.append(this._roundBar);

		document.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') { this._scoreLeft.addScore(); }
			else if (e.key === 'ArrowRight') { this._scoreRight.addScore(); }
			else if (e.key === "Escape") {
				this._scoreLeft.clearScore();
				this._scoreRight.clearScore();
			}
			// pressed R key, total reset
			else if (e.key === "r") {
				this._scoreLeft.clearScore();
				this._scoreRight.clearScore();
				this._fullGameScore.left = 0;
				this._fullGameScore.right = 0;
				const event = new CustomEvent('updateRoundBar', { detail: { score: this._fullGameScore } });
				document.dispatchEvent(event);
			}
		});

		// listen for playerWon event
		document.addEventListener('playerWon', (e) => {
			const { player } = e.detail;
			this._fullGameScore[player] = this._fullGameScore[player] + 1;
			const event = new CustomEvent('updateRoundBar', { detail: { score: this._fullGameScore } });
			document.dispatchEvent(event);
		});

		// listen for updateRoundBar event
		document.addEventListener('updateRoundBar', (e) => {

			const { score } = e.detail;
			const colorLeft = this._scoreLeft.style.backgroundColor;
			const colorRight = this._scoreRight.style.backgroundColor;

			if (score.left + score.right <= this._gamesTotal) {
				const roundBarItems = this._roundBar.getElementsByClassName('round-bar-item');
				for (let i = 0; i < roundBarItems.length; i++) {
					if (i < score.left) {
						roundBarItems[i].style.backgroundColor = colorLeft;
					}
					else if (i >= this._gamesTotal - score.right) {
						roundBarItems[i].style.backgroundColor = colorRight;
					}
					else {
						roundBarItems[i].style.backgroundColor = '#333';
					}
				}
			}
		});
	}

	_createScore(color, player) {

		const Score = document.createElement('div');
		Score.style.backgroundColor = color;
		Score.innerText = "0";
		Score.classList.add('score');

		const addScore = () => {
			const currentScore = Number(Score.innerText);
			Score.innerText = String(Math.min(Number(currentScore) + 1, this._scoreWin));
			if (currentScore === this._scoreWin - 1) {
				// trigger an event to notify class that a player has won a round
				const event = new CustomEvent('playerWon', { detail: { player } });
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

	_popColor() {
		const pickedColor = this._colors[Math.floor(Math.random() * this._colors.length)];
		this._colors = this._colors.filter((color) => color !== pickedColor);
		return pickedColor;
	}
}