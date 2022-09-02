import { GalleryFrame } from './frame.js';

window.onload = () => {
	// By default, we should have one frame.
	const defaultFrame = new GalleryFrame({
		target: document.getElementById('jsGallery')
	});

	defaultFrame.split('row');
	defaultFrame.children[2].split('column');
};