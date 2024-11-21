import { Gallery } from './snap-grid-gallery/gallery.js';
import { PingPongBoard } from './ping-pong-board/board.js';
import { RuneWordsFilter } from "./runes/rune-words-filter.js";
import { emptyDom } from "./utility.js";

const populateAppMenu = () => {

	// makes buttons for each component
	const appDom = document.getElementById('app');
	populateAppMenuItem('Snap Grid Gallery', '/sg', Gallery, appDom);
	populateAppMenuItem('Ping Pong Board', '/board', PingPongBoard, appDom);
	populateAppMenuItem('Rune Words Filter', '/rws', RuneWordsFilter, appDom);
}

const populateAppMenuItem = (text, route, component, target) => {
	const btn = document.createElement('button');
	btn.innerText = text;
	btn.onclick = () => {
		const appDom = document.getElementById('app');
		emptyDom(appDom);
		window.history.pushState({}, text, route);
		new component({
			target: appDom
		});
	}
	target.append(btn);
}

const router = {
	'/board': PingPongBoard,
	'/sg': Gallery,
	'/rws': RuneWordsFilter,
}

const populateDom = (path, target) => {
	emptyDom(target);
	const route = router[path];
	if (route) {
		new route({target: target});
	}
	else {
		populateAppMenu(target);
	}
}

/**
 * Catches redirection from 404.html and handles initial state
 */
const urlParams = new URLSearchParams(window.location.search);
const redirectPath = urlParams.get('redirect_path');
if (redirectPath) {
	history.replaceState(null, '', redirectPath);
	populateDom(!!router[redirectPath] ? redirectPath : "", document.getElementById('app'));
} else {
	populateDom(new URL(window.location.href).pathname, document.getElementById('app'));
}

// On browser back, reset states
window.onpopstate = () => {
	emptyDom(document.getElementById('app'));
	populateDom(new URL(window.location.href).pathname, document.getElementById('app'));
}
