import { PingPongBoard } from './board.js';

window.onload = () => {
	// By default, we should have one frame.
	new PingPongBoard({
		target: document.getElementById('ping-pong-board')
	});
};