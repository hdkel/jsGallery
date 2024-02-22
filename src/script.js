import { GalleryFrame } from './js-gallery/frame.js';
import { PingPongBoard } from './ping-pong-board/board.js';
import { RuneWordsFilter } from "./runes/rune-words-filter.js";
import { WormMath } from "./worm-math/math.js";
import { emptyDom } from "./utility.js";

const populateMenu = (target) => {

	// makes buttons for each component
	target.appendChild(GalleryFrame.makeEntry({target: target}));
	target.appendChild(PingPongBoard.makeEntry({target: target}));
	target.appendChild(RuneWordsFilter.makeEntry({target: target}));
	target.appendChild(WormMath.makeEntry({target: target}));
}

const router = {
	'/board': PingPongBoard,
	'/gallery': GalleryFrame,
	'/rws': RuneWordsFilter,
	'/math': WormMath,
}

const populateDom = (path, target) => {
	emptyDom(target);
	const route = router[path];
	if (route) {
		new route({target: target});
	}
	else {
		populateMenu(target);
	}
}

const target = document.getElementById('app');
populateDom(new URL(window.location.href).pathname, target);

// On browser back, reset states
window.onpopstate = () => {
	populateDom(new URL(window.location.href).pathname);
}
