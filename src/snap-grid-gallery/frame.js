import {FrameMenu} from "./frame_menu.js";

export class Frame {

    static pickColor = () => Math.floor(Math.random()*16777215).toString(16);

    constructor(args) {

        // Extract and set ref.
        const { id, target, bgColor, backgroundImage, gallery } = args;
        this._id = id;
        this._color = bgColor;
        this._backgroundImage = backgroundImage;
        this._gallery = gallery;

        // Makes DOM element
        this._domElement = this._createDomElement();
        this._domElement.class = this;
        target.append(this._domElement);

        new FrameMenu({ target: this._domElement, frame: this });

        this._bindDrop();
    }

    _createDomElement() {
        const dom = document.createElement('div');
        dom.style.backgroundColor = this._color;
        dom.style.backgroundImage = this._backgroundImage;
        dom.classList.add('gFrame');
        return dom;
    }

    _bindDrop() {
        const dom = this._domElement;
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
        this._domElement.style.backgroundImage = value;
        this._gallery.updateProperties(this._id, { backgroundImage: value });
    };

    split(direction = 'row') {
        this._gallery.split(this._id, direction);
    }
}