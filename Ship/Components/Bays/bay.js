// Base class for cargo bays

import { Component } from "../component.js";
import BayDisplay from "../../../Displays/Components/bayDisplay.js";
import GameError from '../../../GameErrors/gameError.js';

const DESCRIPTION = "'Cargo bays' contain minerals and trade goods.\n" +
                    "Each bay can contain a certain maximum mass.\n" +
                    "If a bay is damaged it's capacity is reduced.\n" +
                    "   If the cargo no longer fits the lowest value cargo is dumped.\n" +
                    "The ship's total cargo capacity is the sum of all it's bays."

class Bay extends Component {

    capacity;    

    constructor(type, set, capacity) {
        super(type, set);
        this.capacity = capacity;
        if (undefined != set) {
            set.recalc();
        }
    }  

    getDescription() {
        return (DESCRIPTION);
    }
    
    // Return the display panel for this component.
    getDisplay(ctx, defaultColour) {
        return(new BayDisplay(this.getShip().game, ctx, defaultColour, this));
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
    
    unmount() {
        if ((undefined != this.set) && (1 >= this.set.size)) {
            throw (new GameError("Can't unmount last bay ... nowhere to put it."));
        }
        super.unmount();
    } 
    
    sell() {
        if ((undefined != this.set) && (1 >= this.set.size)) {
            throw (new GameError("Can't sell last bay ... nowhere to put things."))
        }
        super.sell();
    }

    getTargetSet(ship) {
        return(ship.hull.compSets.baySet);
    }
}

export default Bay;