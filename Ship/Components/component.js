// Base class for the components that make up a ship.
//
// Components can be damaged/repaired. So:
//  Extends Goods with a 'status' member.
//  Always has a Goods.number of '1'. Can't bulk individually damagable objects.
import ComponentDisplay from "../../Displays/Components/componentDisplay.js";
import BugError from "../../GameErrors/bugError.js";
import Goods from "../../Trade/goods.js";
import { GoodsType } from "../../Trade/goodsTypes.js";
import GameError from "../../GameErrors/gameError.js";
import ComponentSet from "./componentSet.js";

class ComponentType extends GoodsType {
    maxHp;

    constructor(name, techLevel, mass, cost, maxHp) {
        super(name, name, techLevel, 0, 1, mass, cost)
        this.maxHp = maxHp;
    }
}

class Component extends Goods {

    status;     // % of maxHp. May result in non integer number of HPs.

    // Set if componentDisplay to be shown.
    displayPanel = false;

    constructor(type, set) {
        super(type, set, 1);
        this.status = 100;
    }

    getMaxHp() {
        return (this.type.maxHp);
    }

    toJSON() {
        let json = super.toJSON();
        json.status = this.status;
        json.displayPanel = this.displayPanel;
        return (json);
    }

    // Buy from list.
    buy(ship, isFree) {
        return (super.buy(ship, 1, isFree));
    }

    sell() {
        super.sell(1);

        // Remove display (if present).
        this.displayPanel = false;
        this.getGame().displays.compDisplays.recalc(true);

        // Allow to go out of scope and GC
    }

    // Check if component is mounted.
    // If it's mounted it will be in one of the ship's component sets. If not it will be in a bays componets set.
    isMounted() {
        for (let set of this.set.sets.ship.hull.compSets) {
            if (this.set == set) {
                return (true);
            }
        }
        return (false);
    }

    unloadFromShip(number) {
        if (1 != number) {
            throw (new BugError("Trying to unload multiple components."));
        }

        if (this.isMounted()) {
            this.set.delete(this);
        } else {
            this.set.sets.baySet.unloadGoods(this, number);
        }
    }

    // Get value of the whole thing.
    getValueInSystem(system) {
        let value = super.getValueInSystem(system);

        // Modify depending how damaged it is.
        value *= this.status / 100;
        return (Math.ceil(value));
    }

    getHeadings() {
        let heads = super.getHeadings();
        heads.push("Max HP");
        heads.push("Status(%)");
        return (heads);
    }

    getValues() {
        let vals = super.getValues();
        vals.push(this.getMaxHp());
        vals.push(this.status);
        return (vals);
    }

    getCurrentHp() {
        return (this.getMaxHp() * this.status / 100);
    }

    // Get the target set in a specific ship for this compoent.
    // Over ridden in component classes.
    getTargetSet(ship) {
        throw (new BugError("Unknown component type."));
    }

    // Return the display panel for this component.
    getDisplay(ctx, defaultColour) {
        return (new ComponentDisplay(this.getGame(), ctx, defaultColour, this));
    }

    mount(ship, alsoBuy) {
        // Check that we can we afford it.
        if (alsoBuy) {
            if (this.getValueInSystem(ship.system) > ship.getCredits()) {
                throw (new GameError("Not enough credits."));
            }
        }

        // Work out which set this comp goes into.
        let set = this.getTargetSet(ship);

        // Temporarily add to set. Will throw if no free slots.
        set.add(this);
        set.delete(this);

        // Now we have added complete financial transaction. 
        if (alsoBuy) {
            ship.addCredits(-this.getValueInSystem(ship.system));
        }

        // If it is in a bay remove it.
        let comp;
        if (!alsoBuy) {
            if (ship.getBays().components.has(this)) {
                ship.getBays().components.delete(this);
            }
            comp = this;

            set.add(comp);
            comp.setSet(set);
        } else {
            // Make copy of purchace menu item.
            // Seems to work ... but not sure why.
            comp = new this.constructor(this.getSet());
        }

        if (undefined != ship.getGame().displays) {
            ship.getTerminal().playSound("anvil", 0.5);
        }

        return (comp);
    }

    unmount() {
        if (undefined == this.set) {
            throw (new GameError("Component not mounted"));
        }

        // Remove from current mount point/set.
        let ship = this.getShip();
        this.set.delete(this);
        this.setSet(undefined);
        ship.getTerminal().playSound("saw");

        // Remove display (if present).
        this.displayPanel = false;
        ship.getGame().displays.compDisplays.recalc(true);

        // Put in ships bay
        ship.getBays().components.add(this);
    }

    upgrade() {
        throw (new BugError("Can only upgrade hulls."));
    }

    // Determine if working.
    isWorking() {
        return ((Math.random() * 50) <= this.status);
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

    // Get the repair cost.
    // This will be influenced by the ships docking status and system.
    getRepairCost(percent, ship) {
        percent = this.getMaxRepair(percent, ship);

        let cost = this.getCompleteRepairCost(ship);
        cost *= percent / 100;

        if (0 > cost) {
            cost = 0;
        }

        return (Math.floor(cost));
    }

    // Get current cost to repair 100%
    getCompleteRepairCost(ship) {
        let cost = 0;

        if (null == ship.dockedWith) {
            // Doubled if not docked.
            cost = this.type.cost * 2;
        } else {
            if (this.isAvailableInSystem(ship.system)) {
                // Cost in this system
                cost = this.getUnitCostInSystem(ship.system);
            }
        }
        return (cost);
    }

    // Get the amount to repair based on the ship's situation.
    getMaxRepair(percent, ship) {
        let maxRepair = 100;

        // No more than asked
        if (percent < maxRepair) {
            maxRepair = percent;
        }

        // No more than we can afford.
        let cost = this.getCompleteRepairCost(ship);
        cost *= percent / 100;
        if (ship.getCredits() < cost) {
            maxRepair = Math.floor(percent * (ship.getCredits() / cost));
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
}

export { ComponentType, Component };