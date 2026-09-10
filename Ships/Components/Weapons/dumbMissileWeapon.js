// Base class for dumb missile weapons (DML)
import MissileWeapon from './missileWeapon.js'
import DumbMissile from '../../../GameItems/Projectiles/dumbMissile.js'
import { ComponentType } from '../component.js';

const FIRE_RATE = 4;

const DESCRIPTION = "A cheap weapon that fires unguided (dumb) missiles.";

class DumbMissileWeapon extends MissileWeapon {

    static type = new ComponentType("DML1", 3, 3, 3000, 2,);

    constructor(set) {
        super(set, FIRE_RATE);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }

    shoot(target, date) {
        if (this.isReady(date)) {
            if (super.shoot(target, date)) {
                new DumbMissile(target, this.getShip());
            }
        }
    }

}

export default DumbMissileWeapon;