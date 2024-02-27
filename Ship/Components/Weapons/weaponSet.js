// Base list class for all weapons.

import ComponentSet from '../componentSet.js'

class WeaponSet extends ComponentSet {

    constructor(slots) {
        super("Weapons", slots);
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

    /*
    add(hull) {
        if (0 == this.size) {
            super.add(hull);
            this.totalHp += hull.getHp();
            this.totalRamDamage += hull.ramDamage;
        } else {
            console.log("Only one hull permitted.")
        }
    }

    delete(hull) {
        super.delete(hull)
        this.totalHp -= hull.getHp();
        this.totalRamDamage -= hull.ramDamage;
    }

    takeDamage(hits) {
        // Should really pass random hits on to individual components.
        // this[0].hp -= damage;
        this.totalHp -= hits;
    }
    */
}

export default WeaponSet;