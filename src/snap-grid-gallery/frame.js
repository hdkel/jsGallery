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
        this._layoutNode.class = this;
        this._bindEventHandlers();
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

    _bindEventHandlers() {
        this._boundDrop = this._handleDrop.bind(this);
        this._boundWheel = this._handleWheel.bind(this);
        this._boundMouseDown = this._handleMouseDown.bind(this);
        this._boundMouseMove = this._handleMouseMove.bind(this);
        this._boundMouseUp = this._handleMouseUp.bind(this);

        this._domElement.addEventListener('dragenter', this._handleIgnore);
        this._domElement.addEventListener('dragover', this._handleIgnore);
        this._domElement.addEventListener("drop", this._boundDrop);
        this._domElement.addEventListener('wheel', this._boundWheel);
        this._domElement.addEventListener("mousedown", this._boundMouseDown);
    }

    _handleIgnore(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    _handleDrop(event) {
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
                            backgroundImage: result,
                            // reset the ones below when new pic arrives
                            preferredZoomRatio: null,
                            preferredFocalX: null,
                            preferredFocalY: null,
                        });
                        this._setDefaultZoom();
                        this._setPositionBoundary();
                        this._setDefaultPosition();
                        this.setBackground(result);
                    }
                }
            }
            reader.readAsDataURL(pic);
        }

        event.preventDefault();
        event.stopPropagation();
    }
    _handleWheel(event) {
        event.preventDefault();

        let zoomRatio = this._zoomRatio || 1;
        const zoomRatioOld = zoomRatio;
        const step = (this._zoomRatioMax - this._zoomRatioMin) / 16;
        if (event.deltaY > 0) {
            zoomRatio += step;
        } else {
            zoomRatio -= step;
        }
        this._zoomRatio = clamp(zoomRatio, this._zoomRatioMin, this._zoomRatioMax);
        this._setImgProps({
            preferredZoomRatio: this._zoomRatio,
            ...this._getContainerFocalToUnscaledImagePosition()
        });

        this._setPositionBoundary();
        this._alignToZoomAnchor(event, zoomRatioOld);

        const [displayWidth, displayHeight] = this._scaleDisplaySize();
        this._domElement.style.backgroundSize = `${displayWidth}px ${displayHeight}px`;
    }
    _handleMouseDown(event) {
        this._isDragging = true;
        this._dragStartX = event.clientX;
        this._dragStartY = event.clientY;
        this._domElement.style.cursor = this._imgProps.backgroundImage ? 'grab' : 'default';
        document.addEventListener("mousemove", this._boundMouseMove);
        document.addEventListener("mouseup", this._boundMouseUp);
    }
    _handleMouseMove(event) {
        if (!this._isDragging) return;
        const [positionX, positionY] = this._getDeltaInClamp(event);
        this._domElement.style.backgroundPosition = `${positionX}px ${positionY}px`;
    }
    _handleMouseUp(event) {
        if (!this._isDragging) return;
        this._isDragging = false;
        const [positionX, positionY] = this._getDeltaInClamp(event);
        this._positionX = positionX;
        this._positionY = positionY;
        this._setImgProps(this._getContainerFocalToUnscaledImagePosition());

        this._domElement.style.cursor = 'default';
        document.removeEventListener('mousemove', this._boundMouseMove);
        document.removeEventListener('mouseup', this._boundMouseUp);
    }

    _getDeltaInClamp(event) {
        const deltaX = event.clientX - this._dragStartX;
        const deltaY = event.clientY - this._dragStartY;
        const positionX = clamp(this._positionX + deltaX, this._positionMinX, 0);
        const positionY = clamp(this._positionY + deltaY, this._positionMinY, 0);
        return [positionX, positionY];
    }

    _alignToZoomAnchor(event, zoomRatioOld) {
        const containerRect = this._domElement.getBoundingClientRect();
        const [focalImageX, focalImageY] = this._getZoomEventFocalToImagePosition(event, containerRect);
        const zoomChangeAbsolute = this._zoomRatio - zoomRatioOld;

        // To get how many px the focal point has shifted.
        const focalShiftX = (focalImageX / zoomRatioOld) * zoomChangeAbsolute;
        const focalShiftY = (focalImageY / zoomRatioOld) * zoomChangeAbsolute;

        this._positionX = clamp(this._positionX - focalShiftX, this._positionMinX, 0);
        this._positionY = clamp(this._positionY - focalShiftY, this._positionMinY, 0);
        this._domElement.style.backgroundPosition = `${this._positionX}px ${this._positionY}px`;
    }
    _getZoomEventFocalToImagePosition(event, containerRect) {
        return [event.clientX - containerRect.left - this._positionX, event.clientY - containerRect.top - this._positionY];
    }

    _setImgProps(imgProps) {
        this._imgProps = { ...this._imgProps, ...imgProps };
        this._gallery.updateFrameProperties(this._id, { imgProps: this._imgProps });
    }

    _setDefaultZoom() {
        const properZoomRatio = this._calculateZoomRatioOfContainer([this._domElement.offsetWidth, this._domElement.offsetHeight]);
        this._zoomRatioMin = properZoomRatio;
        this._zoomRatioMax = Math.max(this._zoomRatioMin, this._calculateZoomRatioOfContainer([window.screen.width, window.screen.height]) * 2);

        this._zoomRatio = clamp(this._imgProps.preferredZoomRatio || properZoomRatio, this._zoomRatioMin, this._zoomRatioMax);
        this._setImgProps({
            preferredZoomRatio: this._zoomRatio,
        });

        const [displayWidth, displayHeight] = this._scaleDisplaySize();
        this._domElement.style.backgroundSize = `${displayWidth}px ${displayHeight}px`;
    }

    _calculateZoomRatioOfContainer(containerDimension) {
        const [containerWidth, containerHeight] = containerDimension;
        const imageWidth = this._imgProps.width;
        const imageHeight = this._imgProps.height;

        const containerAspectRatio = containerWidth / containerHeight;
        const imgAspectRatio = imageWidth / imageHeight;

        // image is wider ? fit y-axis : along x
        return containerAspectRatio < imgAspectRatio ? containerHeight / imageHeight : containerWidth / imageWidth;
    }

    _setDefaultPosition() {
        // Has preferred value
        if (this._imgProps.preferredFocalX && this._imgProps.preferredFocalY) {
            const diffX = this._domElement.offsetWidth / 2 - Math.round(this._imgProps.preferredFocalX * this._zoomRatio);
            const diffY = this._domElement.offsetHeight / 2 - Math.round(this._imgProps.preferredFocalY * this._zoomRatio);
            this._positionX = clamp(diffX , this._positionMinX, 0);
            this._positionY = clamp(diffY , this._positionMinY, 0);
        }
        else {
            const [displayWidth, displayHeight] = this._scaleDisplaySize();
            const horizontalExtra = displayWidth - this._domElement.offsetWidth;
            const verticalExtra = displayHeight - this._domElement.offsetHeight;
            this._positionX = (- horizontalExtra / 2);
            this._positionY = (- verticalExtra / 2);
        }

        this._setImgProps(this._getContainerFocalToUnscaledImagePosition());
        this._domElement.style.backgroundPosition = `${this._positionX}px ${this._positionY}px`;
    }

    _getContainerFocalToUnscaledImagePosition() {
        const focalXScaled = this._domElement.offsetWidth / 2 - this._positionX;
        const focalYScaled = this._domElement.offsetHeight / 2 - this._positionY;
        return {
            preferredFocalX: focalXScaled / this._zoomRatio,
            preferredFocalY: focalYScaled / this._zoomRatio,
        }
    }

    _setPositionBoundary() {
        const [displayWidth, displayHeight] = this._scaleDisplaySize();
        this._positionMinX = this._domElement.offsetWidth - displayWidth;
        this._positionMinY = this._domElement.offsetHeight - displayHeight;
    }

    _scaleDisplaySize() {
        const displayWidth = Math.round(this._imgProps.width * this._zoomRatio);
        const displayHeight = Math.round(this._imgProps.height * this._zoomRatio);
        return [displayWidth, displayHeight];
    }

    setBackground(img) {
        this._domElement.style.backgroundImage = img ? `url(${img})` : null;
    };

    // re-renders the UI, called after layout changed or window resized
    render() {
        this._setDefaultZoom();
        this._setPositionBoundary();
        this._setDefaultPosition();
        this.setBackground(this._imgProps.backgroundImage);
    }

    split(direction) {
        if (['row','column'].includes(direction)) {
            this._gallery.split(this._layoutNode, direction);
        }
    }

    removeSelf() {
        this._domElement.removeEventListener("dragenter", this._handleIgnore);
        this._domElement.removeEventListener("dragover", this._handleIgnore);
        this._domElement.removeEventListener("drop", this._boundDrop);
        this._domElement.removeEventListener("wheel", this._boundWheel);
        this._domElement.removeEventListener("mousedown", this._boundMouseDown);
        document.removeEventListener('mousemove', this._boundMouseMove);
        document.removeEventListener('mouseup', this._boundMouseUp);
        this._gallery.removeFrame(this._id);
    }
}