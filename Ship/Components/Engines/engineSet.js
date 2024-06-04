// Base list class for all engines.

import ComponentSet from '../componentSet.js'

class EngineSet extends ComponentSet {

    // So we don't have to add up every time.
    decRate;

    constructor(ship, slots) {
        super("Engines", "Engine", ship, slots);
        this.recalc();
    }

    recalc() {
        super.recalc();

        this.decRate = 0;
        for (let engine of this) {
            // Take best dec rate
            if (engine.decRate > this.decRate) {
                this.decRate = engine.decRate;
            }
        }
    }

    getThrust() {
        let thrust = 0;
        for (let engine of this) { 
            thrust += engine.getThrust();
        }
        return (thrust);
    }

    getDecRate() {
        return (this.decRate);
    }
}

export default EngineSet;