// Base class for avionic
import { Component } from "../component.js";

const DESCRIPTION = "Avionics are the 'brains' of the ship.\n" +
                    "Includes things like Radar, Compass and Computers.\n" +
                    "If multiple versions of a type are installed then the 'best' (and least damaged) one is used."
 
class Avionic extends Component {

    constructor(type, set) {
        super(type, set);
        if (undefined != set) {
            set.recalc();
        }
    }

    getDescription() {
        return (DESCRIPTION);
    }

    getTargetSet(ship) {
        return(ship.hull.compSets.avionicsSet);
    }
}

export default Avionic;