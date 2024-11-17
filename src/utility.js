/**
 * Helper method to clear all children from a DOM
 * @param {Element} element
 */
export const emptyDom = (element) => {
    while(element?.firstChild){
        element.removeChild(element.firstChild);
    }
}

export const hashCode = (length) => {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

export const explicitBool = (input, defaultValue) => (input === undefined || input === null) ? defaultValue : !!input;

export const clamp = (value, min, max) => {
	if (min > max) {
		throw new Error("min cannot be greater than max");
	}
	return Math.max(min, Math.min(max, value));
}