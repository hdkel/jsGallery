
export class PingPongBoard {
	constructor(args) {
		const { target } = args;
		this.populateDom(target);
		this.bindClick();
		this.bindKey();
	}

	populateDom(target) {
		const [rival, rivalScore] = this._createScore();
		this._rival = rival;
		this._rivalScore = rivalScore;
		target.append(this._rival);

		const [fish, fishScore] = this._createScore();
		this._fish = fish;
		this._fishScore = fishScore;
		target.append(this._fish);
	}

	_createScore() {
		const Score = document.createElement('div');
		Score.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);
		Score.classList.add('score');

		const ScoreText = document.createElement('div');
		ScoreText.classList.add('score-text');
		ScoreText.append("0");
		Score.append(ScoreText);

		return [Score, ScoreText];
	}

	bindClick() {
		this._rival.onclick = () => {
			this._rivalScore.innerText = String(Math.min(Number(this._rivalScore.innerText) + 1, 21));
		};

		this._fish.onclick = () => {
			this._fishScore.innerText = String(Math.min(Number(this._fishScore.innerText) + 1, 21));
		};
	}

	bindKey() {
		document.body.onkeydown = (e) => {
			if (e.key === "ArrowLeft") {
				this._rivalScore.innerText = String(Math.min(Number(this._rivalScore.innerText) + 1, 21));
			}
			else if (e.key === "ArrowRight") {
				this._fishScore.innerText = String(Math.min(Number(this._fishScore.innerText) + 1, 21));
			}
			else if (e.key === "Escape") {
				this._rivalScore.innerText = "0";
				this._fishScore.innerText = "0";
			}
		}
	}
}