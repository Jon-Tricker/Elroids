// Base list class for all hulls.
// For now ships only have one hull ... maybe one day it willbe possible to have multiple hulls 'welded together'.

import ComponentSet from '../componentSet.js'

class HullSet extends ComponentSet {

    totalRamDamage = 0;

    constructor(ship, slots) {
        super("Hulls", ship, slots);
    }

    getHp() {
        return(this.totalHp);
    }    
    
    getRamDamage() {
        return(this.totalRamDamage);
    }

    add(hull) {
        if (0 == this.length) {
            super.add(hull);
            this.totalRamDamage += hull.ramDamage;
        } else {
            console.log("Only one hull permitted.")
        }
    }

    delete(hull) {
        super.delete(hull)
        this.totalRamDamage -= hull.ramDamage;
    }
}

export default HullSet;