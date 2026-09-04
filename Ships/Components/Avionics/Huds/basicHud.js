// Basic HUD.
// 
// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Hud from './hud.js';
import BasicHudDisplay from '../../../../Displays/Components/Huds/basicHudDisplay.js';
import { ComponentType } from '../../component.js';

const DESCRIPTION = "A simple gun sight.";

class BasicHud extends Hud {

    static type = new ComponentType("BasicHud", 4, 1, 500, 1);

    constructor(ship) {
        super(BasicHud.type, ship);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }    
    
    // Return the HUD display panel for this component.
    // This is in addition to the Component display panel that all components have.
    getHudDisplay(ctx, defaultColour) {
        return (new BasicHudDisplay(this.getShip().game, ctx, defaultColour, this));
    }
}

export default BasicHud;