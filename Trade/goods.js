// Base class for anything that can be traded, or put in a cargo bay.
//
// Can also represent multiple goods.
// Goods dont have status. If they are damaged the number is reduced.
import GameError from "../GameErrors/gameError.js";

class GoodsType {
    singular;
    plural;
    techLevel;
    magicLevel;
    mass;       // Tonnes
    cost;       // Base cost of a single unit. Credits.

    constructor(singular, plural, techLevel, magicLevel, mass, cost) {
        this.singular = singular;
        this.plural = plural;
        this.techLevel = techLevel;
        this.magicLevel = magicLevel;
        this.mass = mass;
        this.cost = cost;
    }
}

class Goods {
    type;
    set;        // Set of goods that this is a member of.
    number;     // Number of goods.

    constructor(type, set, number) {
        this.type = type;
        this.set = set;

        if (undefined === number) {
            number = 1;
        }
        this.number = number;

        if (undefined != set) {
            set.add(this);
        }
    }

    toJSON() {
        return {
            number: this.number,
            class: this.constructor.name
        }
    }

    getTechLevel() {
        return (this.type.techLevel);
    }

    getDescription() {
        return (this.type.description);
    }

    getShip() {
        return (this.set.getShip());
    }

    getGame() {
        return (this.getUniverse().game);
    }

    getUniverse() {
        return (this.getShip().system.universe);
    }

    // Get ordered collumn headings.
    getHeadings() {
        let heads = new Array();
        heads.push("Name");
        heads.push("Level");
        heads.push("Mass(t)");
        heads.push("Cost(cr)");

        return (heads);
    }

    getValues() {
        let vals = new Array();
        vals.push(this.getName());
        vals.push(this.getTechLevel());
        vals.push(this.getMass());
        vals.push(this.type.cost);

        return (vals);
    }

    getName() {
        if (1 == this.number) {
            return (this.type.singular);
        }
        return (this.type.plural);
    }

    getMass() {
        return (this.type.mass + this.number);
    }

    // Set when added to a set.
    setSet(set) {
        this.set = set;
    }

    getSet() {
        return (this.set);
    }

    // Get value of the whole thing.
    getCurrentValue(system) {
        let value;

        value = this.getCostInSystem(system, this.number);

        return (Math.ceil(value));
    }

    // Get total cost of a number of units in a given system.
    // Takes account of system tech level.
    getCostInSystem(system, number) {
        let value = this.type.cost;
        if (undefined != system) {
            let sysLevel = system.spec.techLevel;

            if (sysLevel < this.getTechLevel()) {
                value *= 1 + ((this.getTechLevel() - sysLevel) / this.getTechLevel());
            }
        } else {
            value = this.type.cost;
        }

        if (undefined != number) {
            value *= number;
        }

        return (value);
    }

    // Buy from list.
    buy(ship, number, isFree) {
        if (undefined === isFree) {
            isFree = false;
        }

        // Check that we can we afford it.
        if ((!isFree) && (this.getCostInSystem(ship.system) * number> ship.getCredits())) {
            throw (new GameError("Not enough credits."));
        }

        // Make copy of purchace menu item.
        // Seems to work ... but not sure why.
        let good = new this.constructor();
        good.number = number;
        
        // Put it in bay. 
        ship.hull.compSets.baySet.loadGoods(good);

        // Now we have added complete financial transaction. 
        if (!isFree) {
            ship.addCredits(-this.getCostInSystem(ship.system) * number);
        }
    }

    sell(number) {
        // Remove from container.
        if (undefined == this.set) {
            throw (new BugError("Cant sell component thats not part of a set."))
        } else {
            this.set.sets.baySet.unloadGoods(this, number)
        }

        // Add value to wallet.
        this.getShip().addCredits(this.getCostInSystem(this.getShip().system));
    }

    // Take damage 
    // Return the amount taken.
    takeDamage(hits) {
        throw (new BugError("Cant damage default goods."));
    }
}

export { GoodsType, Goods };