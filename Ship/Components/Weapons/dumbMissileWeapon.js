// Base class for dumb missile weapons (DML)
import MissileWeapon from './missileWeapon.js'
import DumbMissile from '../../../GameItems/dumbMissile.js'

const FIRE_RATE = 4;

class DumbMissileWeapon extends MissileWeapon {

    constructor(ship) {
        super("DML1", 3, 300, ship, FIRE_RATE);
    }

    fire(target, date) {
        if (this.isReady(date)) {
            try {   
                super.fire(target, date);
                new DumbMissile(target, this.ship);
            }
            catch(GameError) {
                // Failed to fir for some reason.
            }
        }
    }

}

export default DumbMissileWeapon;