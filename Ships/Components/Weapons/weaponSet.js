// Base list class for all weapons.

import ComponentSet from '../componentSet.js'

class WeaponSet extends ComponentSet {

    constructor(sets, slots) {
        super("Weapons", "Weapon", sets, slots);
        this.recalc();
    }

    // Fire all selected weapons.
    fire(target, date) {

        if (undefined == date) {
            date = this.getUniverse().getTime();
        }
        
        for(let weapon of this) {
            weapon.fire(target, date);
        }
    }
}

export default WeaponSet;