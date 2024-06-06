// Display for cargo bay components.
import ComponentDisplay from './componentDisplay.js';
import BarPanel from '../Utils/barPanel.js';

class BayDisplay extends ComponentDisplay {

    cargoPanel;

    constructor(game, ctx, defaultColour, comp) {
        super(game, ctx, defaultColour, comp);

        this.cargoPanel = new BarPanel(ctx, defaultColour, false, "Capacity", "(t)", this.comp.capacity , true);
        this.add(this.cargoPanel);
    }  
    

    animate() {
        this.cargoPanel.setValue(this.comp.getCapacity());
        super.animate();
    }
}

export default BayDisplay;