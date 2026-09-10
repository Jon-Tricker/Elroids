// Mining HUD.
// 
// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Hud from './hud.js';
import MiningHudDisplay from '../../../../Displays/Components/Huds/miningHudDisplay.js';
import { ComponentType } from '../../component.js';

const DESCRIPTION = "Uses an Xray beam to analyse composition of rocks.";

class MiningHud extends Hud {

    static type = new ComponentType("MiningHud", 6, 1, 4000, 1);

    constructor(ship) {
        super(ship);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }    
    
    // Return the HUD display panel for this component.
    // This is in addition to the Component display panel that all components have.
    getHudDisplay(ctx, defaultColour) {
        return (new MiningHudDisplay(ctx, defaultColour, this));
    }
}

export default MiningHud;