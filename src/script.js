import { GalleryFrame } from './js-gallery/frame.js';
import { PingPongBoard } from './ping-pong-board/board.js';
import { RuneWordsFilter } from "./runes/rune-words-filter.js";
import { WormMath } from "./worm-math/math.js";
import { emptyDom } from "./utility.js";

const populateMenu = () => {

	// makes buttons for each component
	app.appendChild(GalleryFrame.makeEntry({target: app}));
	app.appendChild(PingPongBoard.makeEntry({target: app}));
	app.appendChild(RuneWordsFilter.makeEntry({target: app}));
	app.appendChild(WormMath.makeEntry({target: app}));
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
	else if (path === "/math") {
		new WormMath({
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
