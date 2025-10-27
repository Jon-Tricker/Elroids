// Special ComponentDisplay for stuff relating to whole ship.
// 
// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import DarkPanel from '../Utils/darkPanel.js';
import TextPanel from '../Utils/textPanel.js';
import BarPanel from '../Utils/barPanel.js';

class ShipCompDisplay extends DarkPanel {
    game;
    ship;

    speedPanel;

    constructor(game, ctx, defaultColour) {
        super(ctx, defaultColour, true);
        this.game = game;
        this.ship = game.getShip();

        this.add(new TextPanel(ctx, defaultColour, false));
        this.speedPanel = new BarPanel(ctx, defaultColour, false, "Speed", this.getUnits(), this.ship.hull.compSets.hullSet.getMaxSpeed(), false);
        this.add(this.speedPanel);
    }

    getUnits() {
        return("(" + this.ship.getSystem().units + "/s)");
    }

    resize(width, height, x, y) {
        super.resize(width, height, x, y)

        // Make sub panels equal height.
        let index = 0; 
        let spHeight = (this.height - 2 * this.lineWidth)/ this.subPanels.length;
        for (let panel of this.subPanels) {
            panel.resize(this.width - this.lineWidth * 2, spHeight, this.x + this.lineWidth, (this.y + this.lineWidth) + (index * spHeight));
            index++;
        }
    }

    animate() {
        super.animate();

        let text = "System: " + this.ship.getSystem().getName();
        if (null == this.ship.dockedWith) {
            let loc = this.ship.getLocation();
            text += "     Pos: (" + this.printNum(loc.x) + " , " + this.printNum(loc.y) + " , " + this.printNum(loc.z) + ") " + this.ship.getSystem().units;
        } else {
            text += " Docked";
        }
        this.subPanels[0].setText(text);

        this.speedPanel.setMax(this.ship.hull.compSets.hullSet.getMaxSpeed());
        this.speedPanel.setValue(Math.floor(this.ship.getSpeed()));
        this.speedPanel.setUnits(this.getUnits());
    }

    printNum(num) {
        return (this.game.displays.printNum(num));
    }
}

export default ShipCompDisplay;