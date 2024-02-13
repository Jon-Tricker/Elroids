// Base class for hulls

import Component from '../component.js'

class Hull extends Component {

    // Hit Points.
    // TODO maybe should be an attribute of Compnent.
    hp;
    ramDamage;

    constructor(name, mass, cost, hp, ramDamage, ship) {
        super(name, mass, cost, ship);
        this.hp = hp;
        this.ramDamage = ramDamage;
    }

    getHp() {
        return(this.hp);
    }
}

export default Hull;