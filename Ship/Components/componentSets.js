// A group of component sets, for example, a shopping catalogue.

import EngineSet from "./Engines/engineSet.js";
import HullSet from "./Hulls/hullSet.js";
import WeaponSet from "./Weapons/weaponSet.js";
import BaySet from "./Bays/baySet.js";
import JSONSet from "../../Utils/jsonSet.js";

class ComponentSets extends JSONSet {

    // Ship ... or may be purchace list.
    ship;

    // Sub sets
    engineSet; 
    hullSet;
    weaponSet;
    baySet;

    constructor(ship, hullSlots, engineSlots, weaponSlots, baySlots) {
        super();
        this.ship = ship;

        // Create sets. Order will effect order in which status panels are displayed.
        this.hullSet = new HullSet(this, hullSlots);
        super.add(this.hullSet);
        this.engineSet = new EngineSet(this, engineSlots);
        super.add(this.engineSet);
        this.weaponSet = new WeaponSet(this, weaponSlots);
        super.add(this.weaponSet);
        this.baySet = new BaySet(this, baySlots);
        super.add(this.baySet);
    }

    toJSON(skip) {
        let json = [];
        for (let set of this) {
            for (let comp of set) {
                if (comp != skip) {
                    json.push(comp.toJSON());
                }
            }
        }
        return(json)
    }

    getGame() {
        return (this.ship.getGame());
    }

    takeDamage(hits) {
        while((hits > 0) && (this.getCurrentHp() > 0)) {
            // Damage a random set.
            hits -= this.getRandomElement().takeDamage(1);
        }
    }  

    // Get a component by class name.
    getByClass(name) {
        for (let set of this) {
            for (let comp of set) {
                if (comp.constructor.name == name) {
                    return(comp);
                }
            }
        }
        throw(new BugError("Cant find component class " + name));
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