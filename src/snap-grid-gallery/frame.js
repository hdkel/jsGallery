import {FrameMenu} from "./frame_menu.js";
import {clamp, explicitBool, hashCode} from "../utility.js";

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
                                aspectRatio: img.width / img.height,
                                backgroundImage: result
                            });
                            this._setDefaultZoom();
                            this._setDefaultPosition();
                            this._setPositionBoundary();
                            this.setBackground(result);
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
            const zoomRatioOld = zoomRatio;
            const step = (this._zoomRatioMax - this._zoomRatioMin) / 32;
            if (event.deltaY > 0) {
                zoomRatio += step;
            } else {
                zoomRatio -= step;
            }
            this._zoomRatio = clamp(zoomRatio, this._zoomRatioMin, this._zoomRatioMax);

            this._setPositionBoundary();
            this._alignToAnchor(event, zoomRatioOld);

            const [displayWidth, displayHeight] = this._scaleDisplaySize();
            this._domElement.style.backgroundSize = `${displayWidth}px ${displayHeight}px`;
        });
    }

    _alignToAnchor(event, zoomRatioOld) {
        const [focalShiftX, focalShiftY] = this._calculateFocalPointShift(event, zoomRatioOld);

        this._positionX = clamp(this._positionX - focalShiftX, this._positionMinX, 0);
        this._positionY = clamp(this._positionY - focalShiftY, this._positionMinY, 0);
        this._domElement.style.backgroundPosition = `${this._positionX}px ${this._positionY}px`;
    }

    _calculateFocalPointShift(event, zoomRatioOld) {
        const { clientX, clientY } = event;
        const containerRect = this._domElement.getBoundingClientRect();

        const focalContainerX = clientX - containerRect.left;
        const focalImageX = focalContainerX - this._positionX;
        const focalImageXProportion = focalImageX / (this._imgProps.width * zoomRatioOld);
        const sizeChangeX = this._imgProps.width * (this._zoomRatio - zoomRatioOld);

        const focalContainerY = clientY - containerRect.top;
        const focalImageY = focalContainerY - this._positionY;
        const focalImageYProportion = focalImageY / (this._imgProps.height * zoomRatioOld);
        const sizeChangeY = this._imgProps.height * (this._zoomRatio - zoomRatioOld);

        return [sizeChangeX * focalImageXProportion, sizeChangeY * focalImageYProportion];
    }

    _setImgProps(imgProps) {
        this._imgProps = { ...this._imgProps, ...imgProps };
        this._gallery.updateFrameProperties(this._id, { imgProps: this._imgProps });
    }

    _setDefaultZoom() {
        const imgAspectRatio = this._imgProps.aspectRatio;
        const frameAspectRatio = this._domElement.offsetWidth / this._domElement.offsetHeight;

        const frameWidth = this._domElement.offsetWidth;
        const frameHeight = this._domElement.offsetHeight;
        const imgWidth = this._imgProps.width;
        const imgHeight = this._imgProps.height;

        // image is wider ? fit y-axis : along x
        this._zoomRatio = frameAspectRatio < imgAspectRatio ? frameHeight / imgHeight : frameWidth / imgWidth;
        this._zoomRatioMin = this._zoomRatio;
        this._zoomRatioMax = this._zoomRatioMin * 3;

        const [displayWidth, displayHeight] = this._scaleDisplaySize();
        this._domElement.style.backgroundSize = `${displayWidth}px ${displayHeight}px`;
    }

    _setDefaultPosition() {
        const [displayWidth, displayHeight] = this._scaleDisplaySize();
        const horizontalExtra = displayWidth - this._domElement.offsetWidth;
        const verticalExtra = displayHeight - this._domElement.offsetHeight;
        this._positionX = (- horizontalExtra / 2);
        this._positionY = (- verticalExtra / 2);

        this._domElement.style.backgroundPosition = `${this._positionX}px ${this._positionY}px`;
    }

    _setPositionBoundary() {
        const [displayWidth, displayHeight] = this._scaleDisplaySize();
        this._positionMinX = this._domElement.offsetWidth - displayWidth;
        this._positionMinY = this._domElement.offsetHeight - displayHeight;
    }

    _scaleDisplaySize() {
        const displayWidth = (this._imgProps.width * this._zoomRatio);
        const displayHeight = (this._imgProps.height * this._zoomRatio);
        return [displayWidth, displayHeight];
    }

    setBackground(img) {
        this._domElement.style.backgroundImage = img ? `url(${img})` : null;
    };

    // re-renders the UI, called after layout changed or window resized
    render() {
        this._setDefaultZoom();
        this._setDefaultPosition();
        this.setBackground(this._imgProps.backgroundImage);
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