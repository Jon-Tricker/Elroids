// Display for an individual ship component
import * as THREE from 'three';
import DarkPanel from '../Utils/darkPanel.js';
import TextPanel from '../Utils/textPanel.js';
import BarPanel from '../Utils/barPanel.js';

class ComponentDisplay extends DarkPanel {
    game;

    // Our component.
    comp;
    ship;

    statusPanel;

    constructor(game, ctx, defaultColour, comp) {
        super(ctx, defaultColour, true);
        this.game = game;
        this.ship = game.ship;
        this.comp = comp;

        let title = new TextPanel(ctx, defaultColour, false);
        title.setText("    " + comp.getSet().singular + " - " + comp.name);
        this.add(title);

        this.statusPanel = new BarPanel(ctx, defaultColour, false, "Status", "(%)", 100, true);
        this.add(this.statusPanel);
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
        this.statusPanel.setValue(this.comp.status);
        super.animate();
    }
}

export default ComponentDisplay;