// Base list class for the components that make up a ship.
//
// Need random access and fixed order so not a JS 'set'

import GameError from '../../GameErrors/gameError.js'

class ComponentSet extends Array {

    name;
    totalMass = 0;      // Tonnes
    slots = 0;
    ship;

    constructor(name, ship, slots) {
        super();
        this.name = name;
        this.slots = slots;
        this.ship = ship;

        this.recalc();
    }

    // Recalculate any composite variables.
    recalc() { 
        this.totalMass = 0;   
        for (let comp of this) {
            this.totalMass += comp.mass;
        }
    }

    add(comp) {
        if (this.slots <= this.size) {
            throw (new GameError("No free this.slots in " + this.name + " list."));
        }
        super.push(comp)

        this.recalc();
    }

    delete(comp) {
        for (i = 0; i < this.length; i++) {
            if (this[i] == comp) {
                this.splice(i, 1);
                break;
            }
        }
        
        this.recalc();
    }

    getMass() {
        return (this.totalMass);
    }

    getSlots() {
        return (this.slots);
    }

    getRepairCost(percent) {
        let cost = 0;

        for (let comp of this) {
            cost += comp.getRepairCost(percent);
        }
        cost /= this.length;

        return (Math.floor(cost));
    }

    getAverageStatus() {
        let status = 0;
        for (let comp of this) {
            status += comp.status;
        }

        status = Math.floor(status / this.length);

        return (status);
    }

    takeDamage(hits) {
        // Damage a random comp.
        let index = Math.floor(Math.random() * this.length);
        let comp = this[index];
        if (comp.status > 0) {
            let taken = comp.takeDamage(hits)
            this.recalc();
            return (taken);
        } else {
            return(0);
        }
    }

    // Repair a given amount.
    // Reduce score.
    // Return true if fully successful.
    repair(percent) {
        let cost = this.getRepairCost(percent);
        let allDone = true;

        if (0 == cost) {
            return(true);
        }

        // Can we afford it
        if (cost > this.ship.game.player.getCredits()) {
            percent = Math.floor(this.ship.game.player.getCredits() * percent / cost);
            cost = this.ship.game.player.getCredits();
            allDone = false;
        }

        // Do repair
        for (let comp of this) {
            comp.repair(percent);
        }

        if (allDone) {
            this.ship.game.displays.terminal.playSound("anvil", 0.5);
        }

        // Bill player.
        this.ship.addCredits(-cost);

        this.recalc();

        return (allDone);
    }

    getCurrentHp() {
        let hp = 0;
        for (let comp of this) {
            hp += comp.getCurrentHp()
        }
        return(hp);
    }
}

export default ComponentSet;