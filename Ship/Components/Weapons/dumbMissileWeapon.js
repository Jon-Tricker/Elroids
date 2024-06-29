// Base class for dumb missile weapons (DML)
import MissileWeapon from './missileWeapon.js'
import DumbMissile from '../../../GameItems/dumbMissile.js'

const FIRE_RATE = 4;

const DESCRIPTION = "A cheap launcher that fires unguided missiles.";

class DumbMissileWeapon extends MissileWeapon {

    constructor(ship) {
        super("DML1", 3, 3000, 2, ship, FIRE_RATE);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.name + "' is " + DESCRIPTION.toLowerCase());
    }

    fire(target, date) {
        if (this.isReady(date)) {
            super.fire(target, date);
            new DumbMissile(target, this.ship);
        }
    }

}

export default DumbMissileWeapon;