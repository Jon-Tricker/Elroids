// A panel used to overlay controls on top of the screen.

class Panel {
    ctx;
    x;
    y;
    width;
    height;

    lineWidth;
    hasBorder;

    defaultColour;
    defaultBackground = "black";

    subPanels = new Array();

    constructor(ctx, defaultColour, hasBorder) {
        this.ctx = ctx;
        this.defaultColour = defaultColour;
        this.hasBorder = hasBorder;

        this.ctx.fillStyle = this.defaultColour;
        this.ctx.strokeStyle = this.defaultColour;
    }

    resize(width, height, x, y) {
        if (undefined === x) {
            x = 0;
        }

        if (undefined === y) {
            y = 0;
        }

        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.lineWidth = this.ctx.lineWidth;
    }   
    
    add(panel) {
        this.subPanels.push(panel);
    }

    // Delete when animation stops
    clearBox() {
        this.ctx.clearRect(this.x - this.lineWidth, this.y - this.lineWidth , this.width + this.lineWidth * 2 , this.height + this.lineWidth * 2);
    }

    animate() {
        this.clearBox();

        // Border
        if (this.hasBorder) {
            this.ctx.strokeStyle = this.defaultColour;
            this.ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

export default Panel;