// Base list class for the components that make up a ship.
import GoodsSet from '../../Trade/goodsSet.js';

class ComponentSet extends GoodsSet {

    // If slots is undefined can have an unlimited number of components.
    constructor(plural, singular, sets, slots) {
        super(plural, singular, sets, slots); 
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

    getRepairCost(percent, ship) {
        let cost = 0;

        for (let comp of this) {
            cost += comp.getRepairCost(percent, ship);
        }

        return (Math.floor(cost));
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