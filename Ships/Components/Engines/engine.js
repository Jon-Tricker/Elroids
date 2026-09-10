// Base class for engines
import { ComponentAct } from "../component.js";

const DESCRIPTION = "Engines provide 'thrust' to accelerate the ship.\n" +
                    "The ship accelerates (according to F=ma) up to it's maxmum speed.\n" +
                    "If an engine is damaged it produces less thrust.\n" +
                    "The ships total thrust is the sum of all it's engine thrusts.\n" +
                    "'Deceleration' is 'magic' ... Engines thrust against current speed."
 
class Engine extends ComponentAct {

    thrust;         // kN

    constructor(set, thrust) {
        super(set);
        this.thrust = thrust;
        if (undefined != set) {
            set.recalc();
        }
    }

    getDescription() {
        return (DESCRIPTION);
    }

    getThrust() {
        if (!this.isWorking()) {
            return(0);
        }
        
        return(this.thrust * this.status/100);
    }

    getHeadings() {
        let heads = super.getHeadings();
        heads.push("Thrust(kN)");
        return(heads);
    }

    getValues() {
        let vals = super.getValues();
        vals.push(this.thrust);
        return(vals);
    }

    getTargetSet(ship) {
        return(ship.compSets.engineSet);
    }
}

export default Engine;