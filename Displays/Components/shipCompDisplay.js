// Special ComponentDisplay for stuff relating to whole ship.
import * as THREE from 'three';
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
        this.ship = game.ship;

        this.add(new TextPanel(ctx, defaultColour, false));
        this.speedPanel = new BarPanel(ctx, defaultColour, false, "Speed", "(m/s)", this.ship.hull.compSets.hullSet.getMaxSpeed(), false);
        this.add(this.speedPanel);
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

        if (null == this.ship.dockedWith) {
            this.subPanels[0].setText("Ship - Pos : (" + this.printNum(this.ship.location.x) + " , " + this.printNum(this.ship.location.y) + " , " + this.printNum(this.ship.location.z) + ")");
        } else {
            this.subPanels[0].setText("Ship - Docked");
        }

        this.speedPanel.setMax(this.ship.hull.compSets.hullSet.getMaxSpeed());
        this.speedPanel.setValue(Math.floor(this.ship.speed.length()));
    }

    printNum(num) {
        return (this.game.displays.printNum(num));
    }
}

export default ShipCompDisplay;