import RuneWords from "./runeword-dic.js";
import { emptyDom } from "../utility.js";
export class RuneWordsFilter {

	runes = [
		"el", "eld", "tir", "nef", "eth", 'ith',
		'tal', 'ral', 'ort', 'thul', 'amn', 'sol',
		'shael', 'dol', 'hel', 'io', 'lem', 'pul',
		'um', 'mal', 'ist', 'gul', 'vex', 'ohm',
		'lo', 'sur', 'ber', 'jah', 'cham', 'zod'
	];

	constructor(args) {
		const { target } = args;
		this.populateDom(target);
		this.bindEvent();
		this.updateResult([]);
	}

	populateDom(target) {

		this.container = document.createElement('div');
		this.container.classList.add('rw-container');
		target.append(this.container);

		this.searchResult = document.createElement('div');
		this.searchResult.classList.add('rw-search-result');
		this.container.append(this.searchResult);

		this.inputSearch = document.createElement('input');
		this.inputSearch.classList.add('rw-input-search');
		this.container.append(this.inputSearch);
	}

	bindEvent() {
		this.inputSearch.oninput = (evt) => {
			const input = this.parseInput(evt.target.value);
			const hits = this.applyFilter(input);
			this.updateResult(hits);
		};
	}

	parseInput(input) {
		const raw = input.split(" ") || [];
		const valid = [];
		raw.forEach((value) => {
			if (this.runes.includes(value)) {
				valid.push(value);
			}
		});
		return valid || [];
	}

	applyFilter(runes) {
		const hit = [];
		RuneWords.forEach(runeWord => {
			if (runeWord.ingredients.every(rune => runes.includes(rune))) {
				hit.push(runeWord);
			}
		})
		return hit;
	}

	updateResult(hits = []) {

		while(this.searchResult.firstChild){
			this.searchResult.removeChild(this.searchResult.firstChild);
		}

		if (hits.length === 0) {
			this.searchResult.innerText = 'no match';
			return;
		}

		hits.forEach(hit => {
			this.searchResult.innerHTML += `<h2>${hit.name} - ${hit.ingredients.length}</h2>`;
			hit.ingredients.forEach(rune => {
				this.searchResult.innerHTML += `${rune} `;
			})
			this.searchResult.innerHTML += `<br/>`;
		});
	}
}