import {FrameMenu} from "./frame_menu.js";
import {hashCode} from "../utility.js";

export class Frame {

    static pickColor = () => Math.floor(Math.random()*16777215).toString(16);
    static generatePropertyNode = () => ({
        id:  hashCode(4),
        bgColor: Frame.pickColor(),
    });
    static generateLayoutNode = (id) => ({ type: 'frame', id });

    constructor(args) {
        const { target, gallery, node, canRemove } = args;
        this._gallery = gallery;
        this._node = node;
        this._canRemove = canRemove;

        this._frame = this._gallery.getFrameById(node.id);
        this._id = this._frame.id;
        this._color = this._frame.bgColor;
        this._backgroundImage = this._frame.backgroundImage;

        // Makes DOM element
        this._domElement = this._createDomElement();
        this._domElement.class = this;
        node.dom = this._domElement;
        target.append(this._domElement);
        new FrameMenu({ target: this._domElement, frame: this, canRemove: this._canRemove });

        this._bindDrop();
        this._bindWheel();
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
        dom.ondrop = (event) => {
            const pic = event.dataTransfer.files[0];
            if (pic) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.src = ev.target.result;
                    img.onload = () => {
                        this._calculateZoom(img.width / img.height);
                        this.setBackground(ev.target.result);
                    }
                }
                reader.readAsDataURL(pic);
            }

            event.preventDefault();
            event.stopPropagation();
        };
    }

    _bindWheel() {
        this._domElement.addEventListener('wheel', (event) => {
            event.preventDefault();

            let zoomLevel = this._zoomLevel || 100;
            if (event.deltaY > 0) {
                zoomLevel += 10;
            } else {
                zoomLevel -= 10;
            }
            this._zoomLevel = Math.max(this._zoomLevelMin, Math.min(zoomLevel, this._zoomLevelMax));
            this._domElement.style.backgroundSize = `${this._zoomLevel}%`;
        });
    }

    _calculateZoom(imgRatio) {
        this._imgRatio = imgRatio;

        const frameRatio = this._domElement.offsetWidth / this._domElement.offsetHeight;
        const zoomRatio = frameRatio < imgRatio ? imgRatio / frameRatio : 1;

        this._zoomLevel = zoomRatio * 100;
        this._zoomLevelMin = this._zoomLevel;
        this._zoomLevelMax = this._zoomLevelMin * 3;

        this._domElement.style.backgroundSize = `${this._zoomLevel}%`;
        this._gallery.updateFrameProperties(this._id, { imgRatio: this._imgRatio });
    }

    setBackground(value) {
        this._domElement.style.backgroundImage = `url(${value})`;
        this._gallery.updateFrameProperties(this._id, { backgroundImage: value });
    };

    split(direction = 'row') {
        this._gallery.split(this._node, direction);
    }

    removeSelf() {
        this._gallery.removeFrame(this._id);
    }
}