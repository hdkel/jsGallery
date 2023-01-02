import { GalleryFrame } from './js-gallery/frame.js';
import { PingPongBoard } from './ping-pong-board/board.js';

const app = document.getElementById('app');

// Hook the jsGallery button
const btnGallery = document.getElementById('app-js-gallery');
btnGallery.onclick = () => {
	emptyDom(app);
	new GalleryFrame({
		target: document.getElementById('app')
	});
};

// Hook the score board button
const btnScoreBoard = document.getElementById('app-js-ping-pong-board');
btnScoreBoard.onclick = () => {
	emptyDom(app);
	new PingPongBoard({
		target: document.getElementById('app')
	});
}

/**
 * Helper method to clear all children from a DOM
 * @param {Element} element
 */
const emptyDom = (element) => {
	while(element.firstChild){
		element.removeChild(element.firstChild);
	}
}
