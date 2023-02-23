export class PingPongBoard {
	constructor(args) {
		const { target } = args;
		this._colors = ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'];
		target.append(this._createScore('ArrowLeft'));
		target.append(this._createScore('ArrowRight'));
	}

	_createScore(bindKey) {
		const addScore = () => { Score.innerText = String(Math.min(Number(Score.innerText) + 1, 21)); }
		const Score = document.createElement('div');
		const randomColor = this._colors[Math.floor(Math.random() * this._colors.length)];
		this._colors = this._colors.filter((color) => color !== randomColor);

		Score.style.backgroundColor = randomColor;
		Score.innerText = "0";
		Score.classList.add('score');

		document.addEventListener('click', (e) => {
			if (e.target === Score) { addScore(); }
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === bindKey) { addScore(); }
			else if (e.key === "Escape") {
				Score.innerText = "0";
			}
		});

		return Score;
	}
}