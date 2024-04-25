// Base class for hulls

import Component from '../component.js'

class Hull extends Component {

    ramDamage;
    maxSpeed;

    constructor(name, mass, cost, maxHp, ramDamage, maxSpeed, ship) {
        super(name, mass, cost, maxHp, ship);
        this.ramDamage = ramDamage;
        this.maxSpeed = maxSpeed;
    }

    getHeadings() {
        let heads = super.getHeadings();
        heads.push("Ram damage(HP)");
        heads.push("Max speed(m/s)");
        return(heads);
    }

    getValues() {
        let vals = super.getValues();
        vals.push(this.ramDamage);
        vals.push(this.maxSpeed);
        return(vals);
    }
}

export default Hull;