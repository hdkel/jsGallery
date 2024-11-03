import {hashCode} from "../utility.js";

export class Frame {
    constructor(args) {
        this.id = args.id || hashCode();
        this.target = args.target || null;
        this.color = args.bgColor;

        this.render();
    }

    render() {
        const dom = document.createElement('div');
        dom.style.backgroundColor = this.color;
        dom.classList.add('gFrame');
        this.target.append(dom);
    }

    static pickColor() {
        return Math.floor(Math.random()*16777215).toString(16);
    }
}