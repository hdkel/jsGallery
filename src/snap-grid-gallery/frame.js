import {hashCode} from "../utility.js";
import {FrameMenu} from "./frame_menu.js";

export class Frame {
    constructor(args) {
        this.id = args.id || hashCode();
        this.target = args.target || null;
        this.color = args.bgColor;
        this.backgroundImage = args.backgroundImage;
        this.gallery = args.gallery;

        this.render();
        this._bindDrop();
    }

    render() {
        const dom = document.createElement('div');
        dom.style.backgroundColor = this.color;
        dom.style.backgroundImage = this.backgroundImage;
        dom.classList.add('gFrame');

        new FrameMenu({ target: dom, frame: this });
        this.dom = dom;
        this.dom.class = this;
        this.target.append(dom);
    }

    _bindDrop() {
        const dom = this.dom;
        dom.ondragenter = (ev) => { ev.preventDefault(); ev.stopPropagation();}
        dom.ondragover = (ev) => { ev.preventDefault(); ev.stopPropagation(); }
        dom.ondrop = function(event) {
            const pic = event.dataTransfer.files[0];
            if (pic) {
                const reader = new FileReader();
                reader.onload = (ev) => this.setBackground(`url(${ev.target.result})`);
                reader.readAsDataURL(pic);
            }
            event.preventDefault();
            event.stopPropagation();
        }.bind(this);
    }

    setBackground(value) {
        this.dom.style.backgroundImage = value;
        this.gallery.updateProperties(this.id, { backgroundImage: value });
    };

    split(direction = 'row') {
        this.gallery.split(this.id, direction);
    }

    static pickColor() {
        return Math.floor(Math.random()*16777215).toString(16);
    }
}