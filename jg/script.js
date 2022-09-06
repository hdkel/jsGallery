import { GalleryFrame } from './frame.js';

window.onload = () => {
	// By default, we should have one frame.
	new GalleryFrame({
		target: document.getElementById('jsGallery')
	});
};