// Base list class for all hulls.
// For now ships only have one hull ... maybe one day it willbe possible to have multiple hulls 'welded together'.

import ComponentSet from '../componentSet.js'

class HullSet extends ComponentSet {

    totalHp = 0;
    totalRamDamage = 0;

    constructor() {
        super("Hulls");
    }

    getHp() {
        return(this.totalHp);
    }    
    
    getRamDamage() {
        return(this.totalRamDamage);
    }

    add(hull) {
        if (0 == this.size) {
            super.add(hull);
            this.totalHp += hull.getHp();
            this.totalRamDamage += hull.ramDamage;
        } else {
            console.log("Only one hull permitted.")
        }
    }

    delete(hull) {
        super.delete(hull)
        this.totalHp -= hull.getHp();
        this.totalRamDamage -= hull.ramDamage;
    }

    takeDamage(hits) {
        // Should really pass random hits on to individual components.
        // this[0].hp -= damage;
        this.totalHp -= hits;
    }
}

export default HullSet;