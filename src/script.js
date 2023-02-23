import { GalleryFrame } from './js-gallery/frame.js';
import { PingPongBoard } from './ping-pong-board/board.js';
import { RuneWordsFilter } from "./runes/rune-words-filter.js";

/**
 * Helper method to clear all children from a DOM
 * @param {Element} element
 */
const emptyDom = (element) => {
	while(element.firstChild){
		element.removeChild(element.firstChild);
	}
}

const populateMenu = () => {
	// Create the buttons
	const btnGallery = document.createElement('button');
	btnGallery.innerText = 'JS Gallery';
	btnGallery.onclick = () => {
		emptyDom(app);
		window.history.pushState({}, 'JS Gallery', '/gallery');
		new GalleryFrame({
			target: document.getElementById('app')
		});
	};
	app.appendChild(btnGallery);

	// Creates score board button and bind event
	const btnScoreBoard = document.createElement('button');
	btnScoreBoard.innerText = 'Ping Pong Score Board';
	btnScoreBoard.onclick = () => {
		emptyDom(app);
		window.history.pushState({}, 'Ping Pong Score Board', '/board');
		new PingPongBoard({
			target: document.getElementById('app')
		});
	}
	app.appendChild(btnScoreBoard);

	// Creates rune button and binds event
	const btnRune = document.createElement('button');
	btnRune.innerText = 'Rune Words';
	btnRune.onclick = () => {
		emptyDom(app);
		window.history.pushState({}, 'Rune Words', '/rws');
		new RuneWordsFilter({
			target: document.getElementById('app')
		});
	}
	app.appendChild(btnRune);
}

const populateDom = (path) => {
	emptyDom(app);
	if (path === "/board") {
		new PingPongBoard({
			target: document.getElementById('app')
		});
	}
	else if (path === "/gallery") {
		new GalleryFrame({
			target: document.getElementById('app')
		});
	}
	else if (path === "/rws") {
		new RuneWordsFilter({
			target: document.getElementById('app')
		});
	}
	else {
		populateMenu();
	}
}

const app = document.getElementById('app');
populateDom(new URL(window.location.href).pathname);

// On browser back, reset states
window.onpopstate = () => {
	populateDom(new URL(window.location.href).pathname);
}
