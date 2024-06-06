// Base class for cargo bays

import Component from '../component.js'
import BayDisplay from "../../../Displays/Components/bayDisplay.js";

class Bay extends Component {

    capacity;    

    constructor(name, mass, cost, maxHp, ship, capacity) {
        super(name, mass, cost, maxHp, ship);
        this.capacity = capacity;
    }  
    
    // Return the display panel for this component.
    getDisplay(ctx, defaultColour) {
        return(new BayDisplay(this.ship.game, ctx, defaultColour, this));
    }

    getCapacity() {
        return(Math.floor(this.capacity * this.status/100));
    }

    getHeadings() {
        let heads = super.getHeadings();
        heads.push("Capacity(t)");
        return(heads);
    }

    getValues() {
        let vals = super.getValues();
        vals.push(this.capacity);
        return(vals);
    }
}

export default Bay;