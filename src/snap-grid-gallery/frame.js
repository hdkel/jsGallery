import {hashCode} from "../utility.js";

export class Frame {
    constructor(args) {
        this.id = args.id || hashCode();
        this.target = args.target || null;
        this.chidren = args.children || [];
        this.direction = 'row';
        this.color = Math.floor(Math.random()*16777215).toString(16);
    }

    render() {

        const dom = document.createElement('div');
        dom.style.backgroundColor = this.color;
        dom.classList.add('gFrame');
        this.target.append(dom);

        if (this.chidren.length > 1) {
            dom.style.backgroundColor = this.color;
            this.target.append(dom);
        }
        else {

        }
    }

    static pickColor() {
        return Math.floor(Math.random()*16777215).toString(16);
    }
}