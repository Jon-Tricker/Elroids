// Base class for engines

import Component from '../component.js'

const DESCRIPTION = "Engines provide 'thrust' to accelerate the ship.\n" +
                    "The ship accelerates (according to F=ma) up to it's maxmum speed.\n" +
                    "If an engine is damaged it produces less thrust.\n" +
                    "The ships total thrust is the sum of all it's engine thrusts."
                    "For the moment 'deceleration' is 'magic' ...  Engines are not required."

class Engine extends Component {

    thrust;         // kN

    // TODO: Convert to something SI.
    decRate;        // %/s

    constructor(name, mass, cost, maxHp, ship, thrust, decRate) {
        super(name, mass, cost, maxHp, ship);
        this.thrust = thrust;
        this.decRate = decRate;
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
}

export default Engine;