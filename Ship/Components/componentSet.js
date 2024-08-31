// Base list class for the components that make up a ship.

import GameError from '../../GameErrors/gameError.js'

class ComponentSet extends Set {

    plural;
    singular;

    mass = 0;      // Tonnes
    slots = 0;

    // Group of sets that this a member of.
    sets;

    // If slots is undefined can have an unlimited number of components.
    constructor(plural, singular, sets, slots) {
        super();
        this.plural = plural;
        this.singular = singular;

        this.slots = slots;
        this.sets = sets;

        this.recalc();
    }

    // Recalculate any composite variables.
    recalc() {
        this.mass = 0;
        for (let comp of this) {
            this.mass += comp.mass;
        }
    }

    add(comp) {
        if ((undefined != this.slots) && (this.slots <= this.size)) {
            throw (new GameError("No free slots in " + this.plural + " list."));
        }
        super.add(comp)

        comp.setSet(this);

        this.recalc();
    }

    delete(comp) {
        super.delete(comp);

        this.recalc();
    }

    getMass() {
        return (this.mass);
    }

    getSlots() {
        return (this.slots);
    }

    getShip() {
        return (this.sets.ship);
    }

    getUniverse() {
        return (this.getShip().system.universe);
    }

    getGame() {
        return (this.getUniverse().game);
    }

    // Get the repair cost.
    // This will be influenced by the ships docking status and system.
    getRepairCost(percent, ship) {
        let cost = 0;

        for (let comp of this) {
            cost += comp.getRepairCost(percent, ship);
        }

        return (Math.floor(cost));
    }

    getAverageStatus() {
        let status = 0;
        for (let comp of this) {
            status += comp.status;
        }

        status = Math.floor(status / this.size);

        return (status);
    }

    takeDamage(hits) {
        // Damage a random comp.
        let comp = this.getRandomElement();
        if (comp.status > 0) {
            let taken = comp.takeDamage(hits)
            this.recalc();
            return (taken);
        } else {
            return (0);
        }
    }

    // Return a random element of the set.
    // This is a bit inefficient but is rarely used and, in general, we would rather have Sets and Sets ... not Arrays.
    getRandomElement() {
        let index = Math.floor(Math.random() * this.size);

        let i = 0;
        for (let comp of this) {
            if (i == index) {
                return (comp);
            }
            i++;
        }
    }

    // Repair a given amount.
    repair(percent, ship) {
        let allDone = true;
        let someDone = false;

        // Do repair
        for (let comp of this) {
            comp.repair(percent, ship, true);

            if (0 >= ship.getCredits()) {
                allDone = false;
                break;
            }

            someDone = true;
        }

        if (someDone) {
            ship.getTerminal().playSound("anvil", 0.5);
        }

        this.recalc();

        return (allDone);
    }

    getCurrentHp() {
        let hp = 0;
        for (let comp of this) {
            hp += comp.getCurrentHp()
        }
        return (hp);
    }
}

export default ComponentSet;