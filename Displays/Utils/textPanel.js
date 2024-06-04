// A panel used to display a single line of text
import Panel from "./panel.js";

class TextPanel extends Panel{  // Text sizes. Everything else will be scaled relative to this.
    textHeight;
    pt;

    text;

    constructor(ctx, defaultColour, hasBorder) {
        super(ctx, defaultColour, hasBorder);
        this.text="";
    } 
    
    resize(width, height, x, y) {
        this.textHeight = height;
        this.pt = this.textHeight * 0.8;

        super.resize(width, height, x, y)
    }

    setText(text) {
        this.text = text;
    }

    // Delete when animation stops
    clearBox() {
        this.ctx.clearRect(this.x - this.lineWidth, this.y - this.lineWidth , this.width + this.lineWidth * 2 , this.height + this.lineWidth * 2);
    }

    animate() {
        super.animate();    
        
        let oldFont = this.ctx.font;

        this.ctx.font = this.pt + "px serif";  

        this.ctx.strokeText(this.text, this.x, this.y + this.pt);
        
        this.ctx.font = oldFont;
    }
}

export default TextPanel;