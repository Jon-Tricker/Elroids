// A group of component sets, for example, a shopping catalogue.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import EngineSet from "./Engines/engineSet.js";
import AvionicsSet from "./Avionics/avionicsSet.js";
import HullSet from "./Hulls/hullSet.js";
import WeaponSet from "./Weapons/weaponSet.js";
import BaySet from "./Bays/baySet.js";
import JSONSet from "../../Game/Utils/jsonSet.js";

class ComponentSets extends JSONSet {

    // Ship ... or may be purchace list.
    ship;

    // Sub sets
    engineSet;
    hullSet;
    weaponSet;
    baySet;

    // Cached values
    mass;
    hp;

    constructor(ship, hullSlots, engineSlots, weaponSlots, baySlots, avionicsSlots) {
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
        this.avionicsSet = new AvionicsSet(this, avionicsSlots);
        super.add(this.avionicsSet);

        this.recalc();
    }

    toJSON(skip) {
        let json = [];
        for (let set of this) {
            let comps = set.toJSON(skip);

            // Flatten in into single array.
            for (let comp of comps) {
                json.push(comp);
            }
        }
        return (json)
    }

    recalc() {
        this.mass = 0;
        this.hp = 0;
        for (let set of this) {
            set.recalc();
            this.mass += set.getMass(); 
            this.hp += set.getCurrentHp();
        }
    }  
    
    getMass() {
        return (this.mass);
    }

    getTotalMass() {
        return(this.mass + this.baySet.getContentMass());
    }

    getTotalThrust() {
        return(this.engineSet.getTotalThrust());
    }

    getGame() {
        return (this.ship.getGame());
    }

    takeDamage(hits) {
        while ((hits > 0) && (this.getCurrentHp() > 0)) {
            // Damage a random set.
            hits -= this.getRandomElement().takeDamage(1);
        }

        this.recalc();
    }

    // Get a component by class name.
    getByClass(name) {
        for (let set of this) {
            let comp = set.getByClass(name);
            if (null != comp)
                return (comp);
        }

        throw (new BugError("Cant find component class " + name));
    }

    // Return a random element of the set.
    // This is a bit inefficient but is rarely used and, in general, we would rather have Sets and Sets ... not Arrays.
    getRandomElement() {
        let index = Math.floor(Math.random() * this.size);

        let i = 0;
        for (let set of this) {
            if (i == index) {
                return (set);
            }
            i++;
        }
    }

    getCurrentHp() {
        return (this.hp);
    }

    delete(comp) {
        comp.getSet.delete(comp);
        this.recalc();
    }

}

export default ComponentSets;