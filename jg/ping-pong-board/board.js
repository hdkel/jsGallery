
export class PingPongBoard {
	constructor(args) {
		const { target } = args;
		this.populateDom(target);
		this.bindClick();
	}

	populateDom(target) {
		const rival = document.createElement('div');
		rival.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);
		rival.classList.add('score');
		target.append(rival);

		const rivalScore = document.createElement('div');
		rivalScore.classList.add('score-text');
		rivalScore.append(0);
		rival.append(rivalScore);

		this._rival = rival;
		this._rivalScore = rivalScore;

		const fish = document.createElement('div');
		fish.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);
		fish.classList.add('score');
		target.append(fish);

		const fishScore = document.createElement('div');
		fishScore.classList.add('score-text');
		fishScore.append(0);
		fish.append(fishScore);

		this._fish = fish;
		this._fishScore = fishScore;
	}

	bindClick() {
		this._rival.onclick = () => {
			this._rivalScore.innerText = String(Math.min(Number(this._rivalScore.innerText) + 1, 21));
		};

		this._fish.onclick = () => {
			this._fishScore.innerText = String(Math.min(Number(this._fishScore.innerText) + 1, 21));
		};
	}
}