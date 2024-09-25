// Base class for anything that can be traded, or put in a cargo bay..
import GameError from "../GameErrors/gameError.js";

class GoodsType {
    name;
    techLevel;
    mass;       // Tonnes
    cost;       // Credits.
    maxHp;

    constructor(name, techLevel, mass, cost, maxHp) {
        this.name = name;
        this.techLevel = techLevel;
        this.mass = mass;
        this.cost = cost;
        this.maxHp = maxHp;
    }  
}

class Goods {
    goodsType;
    status;     // % of maxHp. May result in non integer number of HPs.
    set;        // Set of goods that this is a member of.

    constructor(type, set) {
        this.goodsType = type;
        this.status = 100;
        this.set = set;

        if (undefined != set) {
            set.add(this);
        }
    }

    toJSON() {
        return { 
            class: this.constructor.name,
            status: this.status
        }
    }

    getTechLevel() {
        return (this.goodsType.techLevel);
    }

    getDescription() {
        return (this.goodsType.description);
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
        heads.push("Max HP");
        heads.push("Status(%)");

        return (heads);
    }

    getValues() {
        let vals = new Array();
        vals.push(this.getName());
        vals.push(this.getTechLevel());
        vals.push(this.getMass());
        vals.push(this.goodsType.cost);
        vals.push(this.goodsType.maxHp);
        vals.push(this.status);

        return (vals);
    }

    getName() {
        return(this.goodsType.name);
    }

    getMass() {
        return(this.goodsType.mass);
    }

    getMaxHp() {
        return (this.goodsType.maxHp);
    }

    // Set when added to a set.
    setSet(set) {
        this.set = set;
    }

    getSet() {
        return (this.set);
    }

    // Buy from purchace list.
    buy(ship, isFree) {
        if (undefined === isFree) {
            isFree = false;
        }

        // Check that we can we afford it.
        if ((!isFree) && (this.getCurrentValue(ship.system) > ship.getCredits())) {
            throw (new GameError("Not enough credits."));
        }

        // Make copy of purchace menu item.
        // Seems to work ... but not sure why.
        let comp = new this.constructor();

        // Put it in bay. 
        ship.hull.compSets.baySet.loadComponent(comp);

        // Now we have added complete financial transaction. 
        if (!isFree) {
            ship.addCredits(-this.getCurrentValue(ship.system));
        }

        return (comp);
    }

    sell() {
        // Remove from container.
        if (undefined != this.set) {
            // We are part of a ship.
            this.set.delete(this)
        } else {
            // We are in a cargo bay.
            this.ship.getBays().components.delete(this);
        }

        // Remove display (if present).
        this.displayPanel = false;
        this.getGame().displays.compDisplays.recalc(true);

        // Add value to wallet.
        this.getShip().addCredits(this.getCurrentValue(this.getShip().system));

        // Allow to go out of scope and GC
    }

    // Take damage 
    // Return the amount taken.
    takeDamage(hits) {
        let dam = Math.floor(hits / this.getMaxHp() * 100);

        if (this.status < dam) {
            // Cant take full damage
            hits = this.getCurrentHp();
            dam = this.status;
        }

        this.status -= dam;
        return (hits)
    }

    getCurrentHp() {
        return (this.getMaxHp() * this.status / 100);
    }

    // Get the repair cost.
    // This will be influenced by the ships docking status and system.
    getRepairCost(percent, ship) {
        percent = this.getMaxRepair(percent, ship);
        let cost

        // Doubled if not docked.
        if (null == ship.dockedWith) {
            // Base cost ... anywhere.
            cost = this.goodsType.cost * 2;
        } else {
            // Cost in this system
            cost = this.getCostInSystem(ship.system);
        }

        cost *= percent / 100;

        if (0 > cost) {
            cost = 0;
        }

        return (Math.floor(cost));
    }

    repair(percent, ship, silent) {
        percent = this.getMaxRepair(percent, ship);
        let cost = this.getRepairCost(percent, ship);

        if (0 < percent) {
            // Do the repair
            this.status += percent;

            // Pay for it.
            ship.addCredits(-cost);

            if (!silent) {
                ship.getTerminal().playSound("anvil", 0.5);
            }
        }
    }

    // Get the amount to repair based on the ship's situation.
    getMaxRepair(percent, ship) {
        let maxRepair = 100;


        // No more than asked
        if (percent < maxRepair) {
            maxRepair = percent;
        }

        // No more than we can afford.
        let affordable = ship.getCredits() / (this.getCostInSystem(ship.system) / 100);
        if (affordable < maxRepair) {
            maxRepair = affordable;
        }

        // Only upto half when undocked.
        let maxRepairable = 100;
        if (null == ship.dockedWith) {
            maxRepairable = 50;
        } else {
            // Only upto half in low tech systems.
            if (ship.system.spec.techLevel < this.getTechLevel()) {
                maxRepairable = 50;
            }
        }

        // No more than can be done.
        if (maxRepair > (maxRepairable - this.status)) {
            maxRepair = maxRepairable - this.status;
        }

        if (0 > maxRepair) {
            maxRepair = 0;
        }

        return (maxRepair)
    }

    getCurrentValue(system) {
        let value;

        if (undefined != system) {
            value = this.getCostInSystem(system);
        } else {
            value = this.goodsType.cost;
        }

        value *= this.status / 100;

        return (Math.ceil(value));
    }

    // Get total cost in a given system.
    // Takes account of system tech level.
    getCostInSystem(system) {
        let value = this.goodsType.cost
        let sysLevel = system.spec.techLevel;

        if (sysLevel < this.getTechLevel()) {
            value *= 1 + ((this.getTechLevel() - sysLevel) / this.getTechLevel());
        }
        return (value);
    }
}

export { GoodsType, Goods };