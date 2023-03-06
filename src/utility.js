/**
 * Helper method to clear all children from a DOM
 * @param {Element} element
 */
export const emptyDom = (element) => {
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
}