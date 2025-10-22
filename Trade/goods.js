// Base class for anything that can be traded, or put in a cargo bay.
//
// Can also represent multiple goods.
// Goods dont have status. If they are damaged the number is reduced.
import GameError from "../GameErrors/gameError.js";
import GoodsCrate from "./goodsCrate.js";


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

    // Make a crate containing this type of goods/
    makeCrate(system, x, y, z, speedX, speedY, speedZ) {  
        let crate = new GoodsCrate(system, x, y, z, speedX, speedY, speedZ, this); 
        return(crate)
    }

    getNumber() {
        return(this.number);
    }

    // Is this legal in a given system.
    isLegal(system) {
        if (undefined == this.type.lawLevel) {
            return (true);
        }
        return (this.type.lawLevel >= system.spec.lawLevel);
    }

    getTechLevel() {
        return (this.type.techLevel);
    }

    getMagicLevel() {
        return (this.type.magicLevel);
    }

    getLawLevel() {
        return (this.type.lawLevel);
    }

    getDescription() {
        return (this.type.description);
    }

    getCost() {
        return (this.type.cost)
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
        heads.push("Tech");
        heads.push("Magic");
        heads.push("Law");
        heads.push("Mass(t)");
        heads.push("Cost(cr)");

        return (heads);
    }

    getValues() {
        let vals = new Array();
        vals.push(this.getName());
        vals.push(this.getTechLevel());
        vals.push(this.getMagicLevel());
        let law = this.getLawLevel();
        if (undefined == law) {
            vals.push("legal");
        } else {
            vals.push(this.getLawLevel());
        }
        vals.push(this.type.mass);
        vals.push(this.type.cost);

        return (vals);
    }

    getName(plural) {
        if (undefined == plural) {
            plural = false;
        }

        if (plural || (1 != this.number)) {
            return (this.type.plural);
        }
        
        return (this.type.singular);
    }

    // Get mass. Handle some dodgy javascript rounding in the calculation.
    getMass() {
        let mass = this.type.mass * this.number;
        mass = Math.round(mass * 1000000)/1000000;
        return (mass);
    }

    // Set when added to a set.
    setSet(set) {
        this.set = set;
    }

    getSet() {
        return (this.set);
    }

    // Get value of the whole thing.
    getValueInSystem(system) {
        let value;

        value = this.getUnitCostInSystem(system, this.number);

        if (undefined != this.number) {
            value *= this.number;
        }

        return (value);
    }

    // Is this available in a given system.
    isAvailableInSystem(system) {
        return((this.type.getTechLevel() <= system.getTechLevel()) && (this.type.getMagicLevel() <= system.getMagicLevel()));
    }

    // Get cost of a unit in a given system.
    getUnitCostInSystem(system) {
        let value = this.type.cost;
        if (undefined != system) {
            // Take account of system levels.
            let sysLevel = system.spec.techLevel;

            if (sysLevel < this.getTechLevel()) {
                value *= 1 + ((this.getTechLevel() - sysLevel) * 0.5);
            }

            sysLevel = system.spec.magicLevel;

            if (sysLevel < this.getMagicLevel()) {
                value *= 1 + ((this.getMagicLevel() - sysLevel) * 0.5);
            }
        }

        return (Math.ceil(value));
    }

    // Buy from list.
    buy(ship, number, isFree) {
        if (undefined === isFree) {
            isFree = false;
        }

        // Check that we can we afford it.
        if ((!isFree) && (this.getValueInSystem(ship.system) * number > ship.getCredits())) {
            throw (new GameError("Not enough credits."));
        }

        // Check that there is capacity.
        if (this.getMass() > ship.hull.compSets.baySet.getAvailableCapacity()) {
            throw (new GameError("Insufficient bay capacity."))
        }

        // Make copy of purchace menu item.
        // Seems to work ... but not sure why.
        let good = new this.constructor();
        good.number = number;

        // Put it in bay.
        this.loadToShip(ship, good);

        // Now we have added complete financial transaction. 
        if (!isFree) {
            ship.addCredits(-this.getValueInSystem(ship.system) * number);
        }

        return (good);
    }

    loadToShip(ship, good) {
        ship.loadGoods(good);
    }

    sell(number) {
        let ship = this.getShip();

        // Remove from container.
        if (undefined == this.set) {
            throw (new BugError("Cant sell goods that are not part of a set."))
        }

        this.unloadFromShip(number);

        if(!this.isLegal(ship.system)) {
            // ToDo: Add more complex penalties/benefits fro illegal sales.=
            if(Math.random() < 0.5) {
                ship.playSound("police");
                throw new GameError("'Elo 'elo 'elo. That's a bit dodgy! ... Goods confiscated.");
            }
        }

        // Add value to wallet.
        ship.addCredits(this.getUnitCostInSystem(this.getShip().system) * number);
    }

    unloadFromShip(number) {
        this.set.sets.baySet.unloadGoods(this, number)
    }

    // Take damage 
    // Return the amount taken.
    takeDamage(hits) {
        throw (new BugError("Cant damage default goods."));
    }
}

export default Goods;