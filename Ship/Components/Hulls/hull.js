// Base class for hulls

import Component from '../component.js'

class Hull extends Component {

    ramDamage;

    constructor(name, mass, cost, maxHp, ramDamage, ship) {
        super(name, mass, cost, maxHp, ship);
        this.ramDamage = ramDamage;
    }
}

export default Hull;