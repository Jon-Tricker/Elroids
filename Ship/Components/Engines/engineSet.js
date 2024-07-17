// Base list class for all engines.

import ComponentSet from '../componentSet.js'

class EngineSet extends ComponentSet {

    constructor(sets, slots) {
        super("Engines", "Engine", sets, slots);
        this.recalc();
    }

    getThrust() {
        let thrust = 0;
        for (let engine of this) { 
            thrust += engine.getThrust();
        }
        return (thrust);
    }
}

export default EngineSet;