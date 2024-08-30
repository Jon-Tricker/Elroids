// Base class for engines

import Component from '../component.js'

const DESCRIPTION = "Engines provide 'thrust' to accelerate the ship.\n" +
                    "The ship accelerates (according to F=ma) up to it's maxmum speed.\n" +
                    "If an engine is damaged it produces less thrust.\n" +
                    "The ships total thrust is the sum of all it's engine thrusts.\n" +
                    "'Deceleration' is 'magic' ... Engines thrust against current speed."
 
class Engine extends Component {

    thrust;         // kN

    constructor(name, techLevel, mass, cost, maxHp, set, thrust) {
        super(name, techLevel, mass, cost, maxHp, set);
        this.thrust = thrust;
        if (undefined != set) {
            set.recalc();
        }
    }

    getDescription() {
        return (DESCRIPTION);
    }

    getThrust() {
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
        return(ship.hull.compSets.engineSet);
    }
}

export default Engine;