// Manager for ComponentDisplays.
import * as THREE from 'three';
import ComponentDisplay from "./componentDisplay.js";
import ShipCompDisplay from "./shipCompDisplay.js";

class ComponentDisplays extends Set {

    displays;

    constructor(game, ctx, defaultColour, displays) {
        super();
        this.displays = displays;
        this.add(new ShipCompDisplay(game, ctx, defaultColour));
        this.add(new ComponentDisplay(game, ctx, defaultColour, game.ship.hullSet[0]), displays);
    }

    add(disp) {
        super.add(disp);
        // this.resize();
    }


    animate() {
        for (let disp of this) {
            disp.animate();
        }
    }

    resize(parentWidth, parentHeight, x, y) {
        let left = true;
        let rowHeight = parentHeight/4;
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
                width = parentWidth - x;
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