// A panel used to display a bar.
import Panel from "./panel.js";
import DarkPanel from "./darkPanel.js";

class BarPanel extends Panel {  // Text sizes. Everything else will be scaled relative to this.
    textHeight;
    pt;

    title;
    units;
    max;
    value;

    titleWidth;
    unitsWidth;

    // Set if high is good.
    invertColour = false;

    constructor(ctx, defaultColour, hasBorder, title, units, max, invertColour) {
        super(ctx, defaultColour, hasBorder);
        this.title = "    " + title + " ";
        this.units = units;
        this.max = max;
        this.invertColour = invertColour;
    }

    setValue(value) {
        this.value = value;
    }  
    
    setMax(max) {
        this.max = max;
    }

    resize(width, height, x, y) {
        this.textHeight = height;
        this.pt = this.textHeight * 0.8;

        let oldFont = this.ctx.font;
        this.ctx.font = this.pt + "px serif";

        // Work out width of fixed size bits.
        this.titleWidth = this.ctx.measureText(this.title).width;
        this.unitsWidth = this.ctx.measureText("" + this.max + "/" + this.max + " (" + this.units + ")").width;

        this.ctx.font = oldFont;

        super.resize(width, height, x, y)
    }

    // Delete when animation stops
    clearBox() {
        this.ctx.clearRect(this.x - this.lineWidth, this.y - this.lineWidth, this.width + this.lineWidth * 2, this.height + this.lineWidth * 2);
    }

    animate() {
        super.animate();

        let oldFont = this.ctx.font;

        this.ctx.font = this.pt + "px serif";

        this.ctx.strokeText(this.title, this.x, this.y + this.pt);

        let valueText = " " + this.value + "/" + this.max;

        // Outer box
        let barMaxWidth = this.width - this.titleWidth - this.unitsWidth;
        this.ctx.strokeRect(this.x + this.titleWidth, this.y + this.lineWidth * 2, barMaxWidth, this.height - this.lineWidth * 4);

        // Sort colour
        let colour = "red";
        let val = Math.round(2 * this.value / this.max);
        if (this.invertColour) {
            val = 2 - val;
        }
        switch (val) {
            case 0:
                colour = "green";
                break;

            case 1:
                colour = "yellow";
                break;

            default:
                break;
        }
        let oldColour = this.ctx.fillStyle;
        this.ctx.fillStyle = colour;
        this.ctx.globalAlpha = DarkPanel.DARKNESS;

        // Bar 
        let barWidth = barMaxWidth * (this.value / this.max) - 2 * this.lineWidth;
        this.ctx.fillRect(this.x + this.titleWidth + this.lineWidth, this.y + this.lineWidth * 3, barWidth, this.height - this.lineWidth * 6);

        this.ctx.fillStyle = oldColour;
        this.ctx.globalAlpha = 1;

        // Textual value + units
        this.ctx.strokeText(valueText + this.units, this.x + this.titleWidth + barMaxWidth, this.y + this.pt);

        this.ctx.font = oldFont;
    }
}

export default BarPanel;