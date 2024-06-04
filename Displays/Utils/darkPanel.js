// A 'tranceluced dark panel used to overlay controls on top of the screen.
import Panel from "./panel.js"

class DarkPanel extends Panel{

    static DARKNESS = 0.5;

    constructor(ctx, defaultColour, hasBorder) {
        super (ctx, defaultColour, hasBorder);
    }

    animate() {
        super.animate();

        // Dim transparent background
        this.ctx.globalAlpha = DarkPanel.DARKNESS;
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(this.x + this.lineWidth, this.y + this.lineWidth, this.width - this.lineWidth * 2 , this.height - this.lineWidth * 2 );
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.defaultColour;

        for (let panel of this.subPanels) {
            panel.animate();
        }
    }
}

export default DarkPanel;