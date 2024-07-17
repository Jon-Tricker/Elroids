// Base list class for all hulls.
// For now ships only have one hull ... maybe one day it willbe possible to have multiple hulls 'welded together'.

import ComponentSet from '../componentSet.js'

class HullSet extends ComponentSet {

    maxSpeed;

    constructor(sets, slots) {
        super("Hulls", "Hull", sets, slots);
        this.recalc();
    }

    recalc() {
        super.recalc();

        this.maxSpeed = 0;
        for (let hull of this) {
            // ToDo : Maybe should be the lowest
            let ms = hull.getMaxSpeed();
            if(ms > this.maxSpeed) {
                this.maxSpeed = ms;
            }

        }
    }

    getHp() {
        return(this.totalHp);
    }  
    
    getMaxSpeed() {
        return(this.maxSpeed);
    }
}

export default HullSet;