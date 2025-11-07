// Non player smuggler.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import NPShip from './NonPlayerShip.js';
import MediumHull from '../Components/Hulls/mediumHull.js';
import { BasicAI, NavMode } from './BasicAI.js';

class SmugglerAI extends BasicAI {
    program = new Array(
        NavMode.CARGO,
        NavMode.STATION_APPROACH,
        NavMode.STATION_DOCK,
        NavMode.WAIT,
        NavMode.UNDOCK,
        NavMode.WORMHOLE,
        NavMode.STOP
    )
}

const HP = 3;

class Smuggler extends NPShip {
    constructor(location) {
        super(5, 10, 20, location, undefined, HP);
        this.ai = new SmugglerAI(this);
    }
    
    // Build/Rebuild ship components.
    buildShip() {
        // Create hull
        // Will also create all other components, for that hull type, and add them to our components sets.
        super.buildShip(MediumHull);
    }

    getClass() {
        return ("Smuggler");
    }
}

export default Smuggler;