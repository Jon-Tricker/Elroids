// Base list class for all engines.

import ComponentSet from '../componentSet.js'

class EngineSet extends ComponentSet {

    // So we don't have to add up every time.
    totalThrust = 0;        // kN
    decRate = 0;

    constructor(ship, slots) {
        super("Engines", ship, slots);
    }

    getThrust() {
        return (this.totalThrust);
    }

    getDecRate() {
        return (this.decRate);
    }

    add(engine) {
        super.add(engine);
        this.totalThrust += engine.getThrust();

        // Take best dec rate
        if (engine.decRate > this.decRate) {
            this.decRate = engine.decRate;
        }
    }

    delete(engine) {
        super.delete(engine)
        this.totalThrust -= engine.getThrust();

        // Take best dec rate
        this.decRate = 0;
        for (const i of this) {
            if (i.decRate > this.decRate) {
                this.decRate = i.decRate;
            }
        }
    }
}

export default EngineSet;