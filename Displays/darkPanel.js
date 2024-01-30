// A 'tranceluced dark panel used to overlay controls on top of the screen.

class DarkPanel {
    ctx;
    x;
    y;
    width;
    height;

    defaultColour;
    defaultBackground = "black";

    constructor(ctx, defaultColour) {
        this.ctx = ctx;
        this.defaultColour = defaultColour;

        this.ctx.fillStyle = this.defaultColour;
        this.ctx.strokeStyle = this.defaultColour;
    }

    resize(parentWidth, parentHeight) {
        this.width = parentWidth;
        this.height = parentHeight;
    }

    // Delete when animation stops
    clearBox() {
        // Need include bounding lines and a bit extra to cove 'anti-aliaasing'.
        let lineWidth = this.ctx.lineWidth *2;
        this.ctx.clearRect(this.x - lineWidth, this.y - lineWidth, this.width + lineWidth * 2, this.height + lineWidth * 2);
    }
 
    animate() {
        this.clearBox();

        // Outer box
        this.ctx.strokeStyle = this.defaultColour;
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Dim transparent background
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.defaultColour;
    }
}

export default DarkPanel;