import { Gallery as Gallery2 } from './absolute-grid-gallery/gallery.js';
import { Gallery } from './snap-grid-gallery/gallery.js';
import { PingPongBoard } from './ping-pong-board/board.js';
import { RuneWordsFilter } from "./runes/rune-words-filter.js";
import { WuwaTeams } from "./wuwa-teams/wuwa-teams.js";
import { emptyDom } from "./utility.js";

const populateAppMenu = () => {

	// makes buttons for each component
	const appDom = document.getElementById('app');
	populateAppMenuItem('Snap Grid Gallery', '/sg', Gallery, appDom);
	populateAppMenuItem('Absolute Grid Gallery (WIP)', '/sg2', Gallery2, appDom);
	populateAppMenuItem('Ping Pong Board', '/board', PingPongBoard, appDom);
	populateAppMenuItem('Rune Words Filter', '/rws', RuneWordsFilter, appDom);
	populateAppMenuItem('Wuwa Teams', '/wuwa', WuwaTeams, appDom);
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
	'/sg2': Gallery2,
	'/wuwa': WuwaTeams
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
const redirectPath = urlParams.get('route');
if (redirectPath) {
	let state = !!router[redirectPath] ? redirectPath : window.location.origin + "/";
	history.replaceState(null, '', state);
}
populateDom(redirectPath || new URL(window.location.href).pathname, document.getElementById('app'));

// On browser back, reset states
window.onpopstate = () => {
	emptyDom(document.getElementById('app'));
	populateDom(new URL(window.location.href).pathname, document.getElementById('app'));
}
