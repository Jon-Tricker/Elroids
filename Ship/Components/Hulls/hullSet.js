// Base list class for all hulls.
// For now ships only have one hull ... maybe one day it willbe possible to have multiple hulls 'welded together'.

import ComponentSet from '../componentSet.js'

class HullSet extends ComponentSet {

    totalRamDamage;
    maxSpeed;

    constructor(ship, slots) {
        super("Hulls", ship, slots);
        this.recalc();
    }

    recalc() {
        super.recalc();

        this.totalRamDamage = 0;  
        this.maxSpeed = 0;
        for (let hull of this) {
            this.totalRamDamage += hull.ramDamage;

            // ToDo : Maybe this should be the lowest.
            if(hull.maxSpeed > this.maxSpeed) {
                this.maxSpeed = hull.maxSpeed;
            }

        }
    }

    getHp() {
        return(this.totalHp);
    }  
    
    getMaxSpeed() {
        return(this.maxSpeed)
    }
    
    getRamDamage() {
        return(this.totalRamDamage);
    }

    add(hull) {
        if (0 == this.length) {
            super.add(hull);
            this.recalc();
        } else {
            console.log("Only one hull permitted.")
        }
    }
}

export default HullSet;