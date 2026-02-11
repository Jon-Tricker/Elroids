// Base list class for all weapons.

import ComponentSet from '../componentSet.js'

class WeaponSet extends ComponentSet {

    constructor(sets, slots) {
        super("Weapons", "Weapon", sets, slots);
        this.recalc();
    }

    // Fire all selected weapons.
    shoot(target, date) {
        for(let weapon of this) {
            weapon.shoot(target, date);
        }
    }
}

export default WeaponSet;