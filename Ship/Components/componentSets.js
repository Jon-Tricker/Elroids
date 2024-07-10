// A group of component sets, for example, a shopping catalogue.

import EngineSet from "./Engines/engineSet.js";
import HullSet from "./Hulls/hullSet.js";
import WeaponSet from "./Weapons/weaponSet.js";
import BaySet from "./Bays/baySet.js";

class ComponentSets extends Set {

    // Sub sets
    engineSet; 
    hullSet;
    weaponSet;
    baySet;

    constructor(ship, hullSlots, engineSlots, weaponSlots, baySlots) {
        super();

        // Create sets. Order will effect order in which status panels are displayed.
        this.hullSet = new HullSet(ship, hullSlots);
        super.add(this.hullSet);
        this.engineSet = new EngineSet(ship, engineSlots);
        super.add(this.engineSet);
        this.weaponSet = new WeaponSet(ship, weaponSlots);
        super.add(this.weaponSet);
        this.baySet = new BaySet(ship, baySlots);
        super.add(this.baySet);
    }

    takeDamage(hits) {
        while((hits > 0) && (this.getCurrentHp() > 0)) {
            // Damage a random set.
            hits -= this.getRandomElement().takeDamage(1);
        }
    }  
    
    // Return a random element of the set.
    // This is a bit inefficient but is rarely used and, in general, we would rather have Sets and Sets ... not Arrays.
    getRandomElement() {
        let index = Math.floor(Math.random() * this.size);

        let i = 0;
        for (let set of this) {
            if (i == index) {
                return(set);
            }
            i++;
        }
    }

    getCurrentHp() {
        let hp = 0;       
        for (let set of this) {
            hp += set.getCurrentHp();
        }
        return(hp);
    }

    getMass() {
        let mass = 0;

        for (const set of this) {
            mass += set.getMass();
        }

        return(mass);
    }

    delete(comp) {
        comp.getSet.delete(comp);
    }

}

export default ComponentSets;