// A panel used to display one or more lines of text.
// Font will be scaled to fill the height available.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Panel from "./panel.js";

class TextPanel extends Panel {

    text;
    maxTxtSz;

    constructor(ctx, defaultColour, hasBorder) {
        super(ctx, defaultColour, hasBorder);
        this.text = new Array;
    }

    resize(width, height, x, y) {
        super.resize(width, height, x, y)
    }

    setText(text) {
        this.text = new Array;
        this.addLn(text);
    }

    setMaxTxtSz(sz) {
        this.maxTxtSz = sz;
    }

    addLn(text) {
        this.text.push(text);
    }

    empty() {
        this.text = new Array;
        this.clearBox();
    }

    // Delete when animation stops
    clearBox() {
        this.ctx.clearRect(this.x - this.lineWidth, this.y - this.lineWidth, 0, this.height / 10);
    }

    animate() {
        super.animate();

        if (0 == this.text.length) {
            return;
        }
        
        let oldFont = this.ctx.font;
        let textHeight = this.height/this.text.length;
        if((undefined != this.maxTxtSz) && (textHeight > this.maxTxtSz)) {
            textHeight = this.maxTxtSz;
        }
        let pt = textHeight * 0.8;
        this.ctx.font = pt + "px serif";

        for(let i = 0; i < this.text.length; i++) {
            this.ctx.strokeText(this.text[i], this.x, this.y + pt * (i + 1));
        }

        this.ctx.font = oldFont;
    }
}

export default TextPanel;