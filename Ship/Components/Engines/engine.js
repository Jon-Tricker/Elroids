// Base class for engines

import Component from '../component.js'

class Engine extends Component {

    thrust;         // kN

    // TODO: Convert to something SI.
    decRate;        // %/s

    constructor(name, mass, cost, thrust, decRate, ship) {
        super(name, mass, cost, ship);
        this.thrust = thrust;
        this.decRate = decRate;
    }

    getThrust() {
        return(this.thrust);
    }
}

export default Engine;