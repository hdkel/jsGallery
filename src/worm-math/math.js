import { emptyDom } from "../utility.js";

export class WormMath {

    constructor(args) {
        const {target} = args;

        // TODO: delete the following and start from here.
        const placeholder = document.createElement('div');
        placeholder.innerText = "This is worm math";
        target.append(placeholder);
    }

    // method that makes button, do not change.
    static makeEntry(args) {

        const btnWormMath = document.createElement('button');
        btnWormMath.innerText = '🐛 Worm Math';
        btnWormMath.onclick = () => {
            emptyDom(args.target);
            window.history.pushState({}, 'Worm Math', '/math');
            new WormMath({
                target: args.target
            });
        }

        return btnWormMath;
    }
}