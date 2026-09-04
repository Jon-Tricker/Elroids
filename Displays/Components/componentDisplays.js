// Manager for ComponentDisplays.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import ShipCompDisplay from "./shipCompDisplay.js";
import Hud from "../../Ships/Components/Avionics/Huds/hud.js";
import HudDisplay from "./Huds/hudDisplay.js";

class ComponentDisplays extends Set {

    displays;
    parentWidth;
    parentHeight;

    ctx;
    hudCtx;
    defaultColour;

    constructor(ctx, hudCtx, defaultColour, displays) {
        super();
        this.defaultColour = defaultColour;
        this.ctx = ctx;
        this.hudCtx = hudCtx;
        this.displays = displays;

        this.recalc(true);
    }

    animate() {
        // Clear HUD area (once for all HUDs).
        this.hudCtx.clearRect(0, 0, this.hudCtx.canvas.width, this.hudCtx.canvas.height);

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
            for (let set of this.displays.game.getShip().hull.compSets) {
                for (let comp of set) {
                    if (comp.displayPanel) {
                        this.add(comp.getDisplay(this.ctx, this.defaultColour));
                    }

                    // Also add the HUD display if there is one.
                    if (comp instanceof Hud) {
                        this.add(comp.getHudDisplay(this.hudCtx, this.defaultColour));
                    }
                }
            }
        }

        // Lay out displays.
        let left = true;
        let rowHeight = this.parentHeight / 4;
        let rowNumber = 0;

        for (let disp of this) {
            if (!(disp instanceof HudDisplay)) {
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
            } else {
                // Give HUD the whole screen.
                let height = this.displays.hud.height;
                let width = this.displays.hud.width;
                disp.resize(width, height, width/2, height/2);
            }
        }
    }
}

export default ComponentDisplays;