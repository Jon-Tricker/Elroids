// Base list class for all cargo bays.

import ComponentSet from '../componentSet.js'
import GameError from "../../../GameErrors/gameError.js"
import Mineral from "../../../GameItems/mineral.js";


class BaySet extends ComponentSet {

    // Capacity
    capacity;

    // Mineral contents
    minerals = new Map();

    // Mass of contents
    contentMass = 0;

    constructor(ship, slots) {
        super("Cargo bays","Cargo bay", ship, slots);
        this.recalc();
    }

    recalc() {
        super.recalc();

        this.capacity = 0;
        for (let bay of this) {
            this.capacity += bay.getCapacity();
        }

        // Ugly but minerals in not initialized when recalc called from super.constructor.
        if (undefined != this.minerals) {
            this.contentMass = 0;
            for (let [key, value] of this.minerals) {
                this.contentMass += value;
            }
        }
    }

    loadMineral(mineral, mass) {

        // Load it all.
        if (this.minerals.has(mineral)) {
            // Update entry for this mineral type.
            this.minerals.set(mineral, this.minerals.get(mineral) + mass)
        } else {
            // Create entry for this mineral type.
            this.minerals.set(mineral, mass);
        }

        this.recalc();

        // Dump any overspill.
        this.level();

        this.recalc();
    }

    // Dump any overspill
    level() {
        let spaceReqd = this.getContentMass() - this.capacity;
        if (0 < spaceReqd) {
            this.ship.game.displays.addMessage("Bay full. Dumping surplus " + spaceReqd + "(t)");
        }

        while (0 < (spaceReqd = this.getContentMass() - this.capacity)) {
            // Find cheapest
            let cheapest = null;
            let cost = null;
            for (let [key, value] of this.minerals) {
                if ((null == cost) || (key.value < cost)) {
                    cheapest = key;
                    cost = key.value;
                }
            }

            if (this.minerals.get(cheapest) < spaceReqd) {
                // Not enough.
                spaceReqd -= this.minerals.get(cheapest);
                this.dumpMineral(cheapest, this.minerals.get(cheapest));
            } else {
                // Enough. Dump and give up
                this.dumpMineral(cheapest, spaceReqd)
                return;
            }
        }
    }

    takeDamage(hits, that) {
        super.takeDamage(hits, that);

        // If now too small dump overspill.
        this.level();
    }

    dumpMineral(mineral, mass) {
        this.unloadMineral(mineral, mass);

        // Make mineral 
        let min = new Mineral(mass, this.ship.location.x, this.ship.location.y, this.ship.location.y, this.ship.speed.x * 0.9, this.ship.speed.y * 0.9, this.ship.speed.z * 0.9, this.ship.game, mineral);

        min.separateFrom(this.ship);
    }

    // Unload a mineral.
    // Return amount unloaded.
    unloadMineral(mineral, mass) {
        // Deduct from cargo.
        if (!this.minerals.has(mineral)) {
            throw (new GameError("No such mineral in bay."))
        }

        let available = this.minerals.get(mineral);
        if (available < mass) {
            mass = available;
        }

        // Update entry for this mineral type.
        this.minerals.set(mineral, available - mass)

        // If 0 remaining delete entry.
        if (0 == this.minerals.get(mineral)) {
            this.minerals.delete(mineral);
        }

        this.recalc();

        return (mass);
    }

    // Get total current mass of contents.
    getContentMass() {
        return (this.contentMass);
    }
}

export default BaySet;