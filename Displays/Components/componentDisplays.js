// Manager for ComponentDisplays.
import ShipCompDisplay from "./shipCompDisplay.js";

class ComponentDisplays extends Set {

    displays;
    parentWidth;
    parentHeight;

    ctx;
    defaultColour;

    constructor(ctx, defaultColour, displays) {
        super();
        this.defaultColour = defaultColour;
        this.ctx = ctx;
        this.displays = displays;

        this.recalc(true);
    }

    animate() {
        for (let disp of this) {
            disp.animate();
        }
    }

    resize(parentWidth, parentHeight, x, y) {
        this.parentWidth = parentWidth;
        this.parentHeight = parentHeight;

        this.recalc(false);
    }

    // Re-calculate the layout.
    recalc(reCreate) {
        if (reCreate) {
            // Delete any existing displays
            this.clear();

            // Create new displays
            this.add(new ShipCompDisplay(this.displays.game, this.ctx, this.defaultColour));
            for (let set of this.displays.game.ship.compSets) {
                for (let comp of set) {
                    if (comp.displayPanel) {
                        this.add(comp.getDisplay(this.ctx, this.defaultColour));
                    }
                }
            }
        }

        // Lay out displays.
        let left = true;
        let rowHeight = this.parentHeight / 4;
        let rowNumber = 0;

        for (let disp of this) {
            let x;
            let y;
            let width;
            let height;

            // Alternate sides
            if (left) {
                x = 0;
                y = rowHeight * (3 - rowNumber);
                width = this.displays.radar.x;
                height = rowHeight;
            } else {
                x = this.displays.radar.x + this.displays.radar.width;
                y = rowHeight * (3 - rowNumber);
                width = this.parentWidth - x;
                height = rowHeight;
            }

            disp.resize(width, height, x, y);

            // Next display
            left = !left;
            if (left) {
                rowNumber++;
            }
        }
    }
}

export default ComponentDisplays;