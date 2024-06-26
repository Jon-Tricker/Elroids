// Base class for missile weapons
import Weapon from './weapon.js';

const DESCRIPTION = "'Missile weapons' fire physical projectiles.\n" +
                    "The missles vary in effect, speed and lifetime.\n" +
                    "If a missile weapon is damaged it may fail to fire."

class MissileWeapon extends Weapon {

    constructor(name, mass, cost, maxHp, ship, fireRate, maxAmmo) {
        super(name, mass, cost, maxHp, ship, fireRate, maxAmmo);
    }   
    
    getDescription() {
        return (super.getDescription() + "\n\n" + DESCRIPTION);
    }
}

export default MissileWeapon;