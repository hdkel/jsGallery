export class Container {

    constructor(args) {
        const { target, mode } = args;

        this.domElement = this.createDomElement(mode);
        this.domElement.class = this;
        target.append(this.domElement);

        return this.domElement;
    }

    createDomElement(mode) {
        const dom = document.createElement('div');
        dom.classList.add('gContainer');
        dom.classList.add({'row': 'gContainer-horizontal', 'column': 'gContainer-vertical'}[mode] || 'gContainer-horizontal');
        return dom;
    }
}