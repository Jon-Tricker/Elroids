// Base list class for all engines.

import ComponentSet from '../componentSet.js'

class EngineSet extends ComponentSet {

    // Cached total thrust
    thrust;

    constructor(sets, slots) {
        super("Engines", "Engine", sets, slots);
        this.recalc();
    }

    recalc() { 
        super.recalc();
        
        this.thrust = 0;
        for (let engine of this) { 
            this.thrust += engine.getThrust();
        }
    }

    getTotalThrust() {
        return(this.thrust);
    }
}

export default EngineSet;