export class Container {
    constructor(args) {
        const { target, mode } = args;
        this.dom = this.populateDom(target, mode);
        return this.dom;
    }

    populateDom(target, mode) {
        const dom = document.createElement('div');
        dom.classList.add('gContainer');
        dom.classList.add(mode === 'row' ? 'gContainer-horizontal' : 'gContainer-vertical');
        dom.control = this;
        target.append(dom);
        return dom;
    }
}