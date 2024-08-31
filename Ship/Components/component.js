// Base class for the components that make up a ship.

// For now ships are made of components. Other things are just 'lumps'.
import ComponentDisplay from "../../Displays/Components/componentDisplay.js";
import BugError from "../../GameErrors/bugError.js";
import GameError from "../../GameErrors/gameError.js";
import Goods from "../../Trade/goods.js";

class Component extends Goods {

    // Set if componentDisplay to be shown.
    displayPanel = false;

    constructor(name, techLevel, mass, cost, maxHp, set) {
        super (name, techLevel, mass, cost, maxHp, set);
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

    upgrade() {
        throw (new BugError("Can only upgrade hulls."));
    }

    // Determine if working.
    isWorking() {
        return ((Math.random() * 50) <= this.status);
    }
}

export default Component;