// Base list class for all weapons.

import ComponentSet from '../componentSet.js'

class WeaponSet extends ComponentSet {

    constructor(ship, slots) {
        super("Weapons", "Weapon", ship, slots);
        this.recalc();
    }

    recalc() {
        super.recalc();
    }

    // Fire all selected weapons.
    fire(target, date) {

        if (undefined == date) {
            date = Universe.getTime();
        }
        
        for(let weapon of this) {
            weapon.fire(target, date);
        }
    }
}

export default WeaponSet;