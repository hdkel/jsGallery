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
        this._imgProps = this._propertyNode.imgProps || {};

        // Makes DOM element and bind interactions
        this._layoutNode.dom = this._domElement = this._createDomElement(target);
        this._bindDrop();
        this._bindWheel();
        this._layoutNode.class = this;
    }

    _createDomElement(target) {
        const dom = document.createElement('div');
        dom.class = this;
        dom.style.backgroundColor = this._color;
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
                    const result = ev.target.result;
                    if (typeof result === 'string') {
                        img.src = result;
                        img.onload = () => {
                            this._setImgProps({
                                width: img.width,
                                height: img.height,
                                ratio: img.width / img.height,
                                backgroundImage: result
                            });
                            this._setZoom();
                            this._setPosition();
                            this.setBackground();
                        }
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

            let zoomRatio = this._zoomRatio || 1;
            const step = (this._zoomRatioMax - this._zoomRatioMin) / 100;
            if (event.deltaY > 0) {
                zoomRatio += step;
            } else {
                zoomRatio -= step;
            }
            this._zoomRatio = Math.max(this._zoomRatioMin, Math.min(zoomRatio, this._zoomRatioMax));

            const displayWidth = Math.round(this._imgProps.width * this._zoomRatio);
            const displayHeight = Math.round(this._imgProps.height * this._zoomRatio);
            this._domElement.style.backgroundSize = `${displayWidth}px ${displayHeight}px`;
        });
    }

    _setImgProps(imgProps) {
        this._imgProps = { ...this._imgProps, ...imgProps };
        this._gallery.updateFrameProperties(this._id, { imgProps: this._imgProps });
    }

    _setZoom() {
        const imgRatio = this._imgProps.ratio;
        const frameRatio = this._domElement.offsetWidth / this._domElement.offsetHeight;

        const frameWidth = this._domElement.offsetWidth;
        const frameHeight = this._domElement.offsetHeight;
        const imgWidth = this._imgProps.width;
        const imgHeight = this._imgProps.height;

        this._zoomRatio = frameRatio < imgRatio ? frameHeight / imgHeight : frameWidth / imgWidth;
        this._zoomRatioMin = this._zoomRatio;
        this._zoomRatioMax = this._zoomRatioMin * 2;

        const displayWidth = Math.round(this._imgProps.width * this._zoomRatio);
        const displayHeight = Math.round(this._imgProps.height * this._zoomRatio);
        this._domElement.style.backgroundSize = `${displayWidth}px ${displayHeight}px`;
    }

    _setPosition() {
        const displayWidth = Math.round(this._imgProps.width * this._zoomRatio);
        const displayHeight = Math.round(this._imgProps.height * this._zoomRatio);
        const horizontalExtra = displayWidth - this._domElement.offsetWidth;
        const verticalExtra = displayHeight - this._domElement.offsetHeight;
        this._domElement.style.backgroundPosition = `-${horizontalExtra / 2}px -${verticalExtra / 2}px`;
    }

    setBackground() {
        this._domElement.style.backgroundImage = this._imgProps.backgroundImage ? `url(${this._imgProps.backgroundImage})` : null;
    };

    // re-renders the UI, called after layout changed or window resized
    render() {
        this._setZoom();
        this._setPosition();
        this.setBackground();
    }

    split(direction) {
        if (['row','column'].includes(direction)) {
            this._gallery.split(this._layoutNode, direction);
        }
    }

    removeSelf() {
        this._gallery.removeFrame(this._id);
    }
}