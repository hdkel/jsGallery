import {hashCode} from "../utility.js";
import {Frame} from "./frame.js";

export class Gallery {

    constructor(args) {
        const { target } = args;

        this._layout = [];
        this._frames = [];
        this._initFrameData();
    }

    _initFrameData() {
        const id = hashCode(5);
        const frame = {
            id,
            bgColor: Frame.pickColor(),
        };
        this._layout.push(id);
        this._frames.push(frame);
    }
}