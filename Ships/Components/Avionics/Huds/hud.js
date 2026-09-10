// Base class for head up displays (HUDs). i.e. weapon sights.
// 
// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import { ComponentAct } from "../../component.js";
import BugError from "../../../../Game/bugError.js";

const DESCRIPTION = "Head Up Displays (HUds) are on screen 'sights' for weapons etc.\n\n" +
                    "If a ship has multiple HUDs then their graphical components are combined."

class Hud extends ComponentAct {

    constructor(set) {
        super(set);
        if (undefined != set) {
            set.recalc();
        }
    }

    getDescription() {
        return (DESCRIPTION);
    }
    
    repair(percent, ship, silent) {
        super.repair(percent, ship, silent);
        this.set.recalc();
    }

    // Return the HUD display panel for this component.
    // This is in addition to the Component display panel that all components have.
    getHudDisplay(ctx, defaultColour) {
        throw new BugError("Cannot get display for base HUD class.")
    }

    getTargetSet(ship) {
        return (ship.compSets.avionicsSet);
    }
}

export default Hud;