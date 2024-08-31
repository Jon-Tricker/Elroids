// Base class for the components that make up a ship.

// For now ships are made of components. Other things are just 'lumps'.
import ComponentDisplay from "../../Displays/Components/componentDisplay.js";
import BugError from "../../GameErrors/bugError.js";
import GameError from "../../GameErrors/gameError.js";

class Component {

    name;
    techLevel;
    mass;       // Tonnes
    cost;       // Credits.
    maxHp;
    status;     // % of maxHp. May result in non integer number of HPs.
    set;

    // Set if componentDisplay to be shown.
    displayPanel = false;

    constructor(name, techLevel, mass, cost, maxHp, set) {
        this.name = name;
        this.techLevel = techLevel;
        this.mass = mass;
        this.cost = cost;
        this.maxHp = maxHp;
        this.set = set;
        this.status = 100;

        if (undefined != set) {
            set.add(this);
        }
    }

    /*
    clone() {
        log.console("Cloning raw component ... Dubious!")
        return (new Component(this.name, this.mass, this.cost, this.maxHp, this.getShip()));
    }
    */

    getTechLevel() {
        return (this.techLevel);
    }

    getDescription() {
        throw (new BugError("No description for default component."));
    }

    getGame() {
        return (this.set.sets.ship.system.universe.game);
    }

    getUniverse() {
        return (this.set.sets.ship.system.universe);
    }


    // Set when added to a set.
    setSet(set) {
        this.set = set;
    }

    getSet() {
        return (this.set);
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
        vals.push(this.name);
        vals.push(this.techLevel);
        vals.push(this.mass);
        vals.push(this.cost);
        vals.push(this.maxHp);
        vals.push(this.status);

        return (vals);
    }

    getMaxHp() {
        return (this.maxHp);
    }

    getShip() {
        return (this.set.getShip());
    }

    mount(ship, alsoBuy) {
        // Check that we can we afford it.
        if (alsoBuy) {
            if (this.getCurrentValue(ship.system) > ship.getCredits()) {
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
            ship.addCredits(-this.getCurrentValue(ship.system));
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

    upgrade() {
        throw (new BugError("Can only upgrade hulls."));
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

    // Determine if working.
    isWorking() {
        return ((Math.random() * 50) <= this.status);
    }

    // Get the repair cost.
    // This will be influenced by the ships docking status and system.
    getRepairCost(percent, ship) {
        percent = this.getMaxRepair(percent, ship);
        let cost

        // Doubled if not docked.
        if (null == this.getShip().dockedWith) {
            // Base cost ... anywhere.
            cost = this.cost * 2;
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
        if (null == this.getShip().dockedWith) {
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
            value = this.cost;
        }

        value *= this.status / 100;

        return (Math.ceil(value));
    }

    // Get total cost in a given system.
    // Takes account of system tech level.
    getCostInSystem(system) {
        let value = this.cost
        let sysLevel = system.spec.techLevel;

        if (sysLevel < this.getTechLevel()) {
            value *= 1 + ((this.getTechLevel() - sysLevel) / this.getTechLevel());
        }
        return (value);
    }
}

export default Component;