// Base class for avionic
import { ComponentAct } from "../component.js";

const DESCRIPTION = "Avionics are the 'brains' of the ship.\n" +
                    "Includes components like Radar, Compass and Computers.\n" +
                    "If multiple versions of a type are installed then the 'best' (and least damaged)\n" +
                    "is used."
 
class Avionic extends ComponentAct {

    constructor(set) {
        super(set);
        if (undefined != set) {
            set.recalc();
        }
    }

    getDescription() {
        return (DESCRIPTION);
    }

    getTargetSet(ship) {
        return(ship.compSets.avionicsSet);
    }
}

export default Avionic;