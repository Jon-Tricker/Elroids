// Base class for missile weapons
import Weapon from './weapon.js';

class MissileWeapon extends Weapon {

    constructor(name, mass, cost, maxHp, ship, fireRate, maxAmmo) {
        super(name, mass, cost, maxHp, ship, fireRate, maxAmmo);
    }
}

export default MissileWeapon;