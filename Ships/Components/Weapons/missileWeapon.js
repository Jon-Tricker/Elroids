// Base class for missile weapons
import Weapon from './weapon.js';

const DESCRIPTION = "'Missile weapons' fire physical projectiles.\n" +
                    "The missiles vary in effect, speed and maximum range."

class MissileWeapon extends Weapon {

    constructor(set, fireRate, maxAmmo) {
        super(set, fireRate, maxAmmo);
    }   
    
    getDescription() {
        return (super.getDescription() + "\n\n" + DESCRIPTION);
    }
}

export default MissileWeapon;