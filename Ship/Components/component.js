// Base class for the components that make up a ship.

// For now ships are made of components. Other things are just 'lumps'.
import ComponentDisplay from "../../Displays/Components/componentDisplay.js";
import BugError from "../../GameErrors/bugError.js";
import GameError from "../../GameErrors/gameError.js";

class Component {

    name;
    mass;       // Tonnes
    cost;       // Credits.
    maxHp;
    status;     // % of maxHp. May result in non integer number of HPs.
    set;

    // Set if componentDisplay to be shown.
    displayPanel = false;

    constructor(name, mass, cost, maxHp, set) {
        this.name = name;
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

    getDescription() {
        throw (new BugError("No description for default component."));
    }

    getGame() {
        return(this.set.sets.ship.system.universe.game);
    }

    getUniverse(){
        return(this.set.sets.ship.system.universe);
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
        heads.push("Mass(t)");
        heads.push("Cost(cr)");
        heads.push("Max HP");
        heads.push("Status(%)");

        return (heads);
    }

    getValues() {
        let vals = new Array();
        vals.push(this.name);
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
        return(this.set.getShip());
    }

    mount(ship, alsoBuy) {
        // Check that we can we afford it.
        if (alsoBuy) {
            if (this.getCurrentValue() > ship.getCredits()) {
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
            ship.addCredits(-this.getCurrentValue());
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

        return(comp);
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
        if ((!isFree) && (this.getCurrentValue() > ship.getCredits())) {
            throw (new GameError("Not enough credits."));
        }

        // Make copy of purchace menu item.
        // Seems to work ... but not sure why.
        let comp = new this.constructor();

        // Put it in bay. 
        ship.hull.compSets.baySet.loadComponent(comp);

        // Now we have added complete financial transaction. 
        if (!isFree) {
            ship.addCredits(-this.getCurrentValue());
        }

        return(comp);
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
        this.getShip().addCredits(this.getCurrentValue());

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

    getRepairCost(percent) {
        let maxRepair = 100;
        if (null == this.getShip().dockedWith) {
            maxRepair = 50;
        }

        let toDo = percent;
        if (maxRepair - this.status < percent) {
            toDo = maxRepair - this.status;
        }

        let cost = this.cost * toDo / 100;

        if (null == this.getShip().dockedWith) {
            cost *= 2;
        }

        if (0 > cost) {
            cost = 0;
        }

        return (cost);
    }

    repair(percent) {
        let maxRepair = 100;
        if (null == this.getShip().dockedWith) {
            maxRepair = 50;
        }

        if (percent + this.status > maxRepair) {
            percent = maxRepair - this.status;
        }

        if (0 < percent) {
            this.status += percent;
        }
    }

    getCurrentValue() {
        return (Math.ceil(this.cost * this.status / 100));
    }
}

export default Component;