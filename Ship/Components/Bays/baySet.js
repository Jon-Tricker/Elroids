// Base list class for all cargo bays.

import ComponentSet from '../componentSet.js'

class BaySet extends ComponentSet {

    // Capacity
    capacity;

    constructor(ship, slots) {
        super("Cargo bays", ship, slots);
        this.recalc();
    }

    recalc() {
        super.recalc();

        this.capacity = 0;
        for (let bay of this) {
            this.capacity += bay.getCapacity();
        }
    }

}

export default BaySet;