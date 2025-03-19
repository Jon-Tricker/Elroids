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
    
    repair(percent, ship, silent) {
        super.repair(percent, ship, silent);
        this.set.recalc();
    }

    // Return the display panel for this component.
    getDisplay(ctx, defaultColour) {
        return (new BayDisplay(this.getShip().game, ctx, defaultColour, this));
    }

    getCapacity() {
        return (Math.floor(this.capacity * this.status / 100));
    }

    getHeadings() {
        let heads = super.getHeadings();
        heads.push("Capacity(t)");
        return (heads);
    }

    getValues() {
        let vals = super.getValues();
        vals.push(this.capacity);
        return (vals);
    }

    unmount() {
        this.checkRemoval();
        super.unmount();
    }

    sell() {
        this.checkRemoval();
        super.sell();
    }

    // Check that removal won't cause problems.
    checkRemoval() {
        if (this.isMounted()) {
            if ((undefined != this.set) && (1 >= this.set.size)) {
                throw (new GameError("Can't remove last bay ... nowhere to put it."));
            }

            // Check cargo will fit in remaining bays.
            if (undefined != this.set) {
                let overflow = this.getCapacity() - (this.set.capacity - this.set.getContentMass());
                if (0 < overflow) {
                    throw (new GameError("Not enough space for remaining cargo. Dispose of " + overflow + "(T) and try again."));
                }
            }
        }
    }

    getTargetSet(ship) {
        return (ship.hull.compSets.baySet);
    }
}

export default Bay;