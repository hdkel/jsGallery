import {FrameMenu} from "./frame_menu.js";
import {explicitBool, hashCode} from "../utility.js";

export class Frame {

    static pickColor = () => Math.floor(Math.random()*16777215).toString(16);
    static generatePropertyNode = () => ({
        id:  hashCode(4),
        bgColor: Frame.pickColor(),
    });
    static generateLayoutNode = (id) => ({ type: 'frame', id });

    constructor(args) {

        // Extract and set class properties
        const { target, gallery, layoutNode, canRemove } = args;
        this._gallery = gallery;
        this._layoutNode = layoutNode;
        this._canRemove = explicitBool(canRemove, true);

        // Property node props.
        this._propertyNode = this._gallery.getFramePropertyNodeById(this._layoutNode.id);
        this._id = this._propertyNode.id;
        this._color = this._propertyNode.bgColor;
        this._backgroundImage = this._propertyNode.backgroundImage;

        // Makes DOM element and bind interactions
        this._layoutNode.dom = this._domElement = this._createDomElement(target);
        this._bindDrop();
        this._bindWheel();
    }

    _createDomElement(target) {
        const dom = document.createElement('div');
        dom.class = this;
        dom.style.backgroundColor = this._color;
        dom.style.backgroundImage = this._backgroundImage;
        dom.classList.add('gFrame');

        new FrameMenu({ target: dom, frame: this, canRemove: this._canRemove });
        target.append(dom);
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
        this._domElement.style.backgroundImage = value ? `url(${value})` : null;
        this._gallery.updateFrameProperties(this._id, { backgroundImage: value });
    };

    split(direction) {
        if (['row','column'].includes(direction)) {
            this._gallery.split(this._layoutNode, direction);
        }
    }

    removeSelf() {
        this._gallery.removeFrame(this._id);
    }
}