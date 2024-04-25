// Base class for dumb missile weapons (DML)
import MissileWeapon from './missileWeapon.js'
import DumbMissile from '../../../GameItems/dumbMissile.js'

const FIRE_RATE = 4;

class DumbMissileWeapon extends MissileWeapon {

    constructor(ship) {
        super("DML1", 3, 3000, 2, ship, FIRE_RATE);
    }

    fire(target, date) {
        if (this.isReady(date)) {
            try {   
                super.fire(target, date);
                new DumbMissile(target, this.ship);
            }

            catch(error) {
                // Failed to for for some reason. e.g. out of ammo. 
                this.ship.game.displays.addMessage(error);
            }
        }
    }

}

export default DumbMissileWeapon;