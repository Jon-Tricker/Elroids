// Non player freighter. Starts with cargo takes it to the station via a random location.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import NPShip from './nonPlayerShip.js';
import LargeHull from '../Components/Hulls/largeHull.js';
import {BasicAI} from './basicAI.js';

class FreighterAI extends BasicAI {
}

const HP = 3;

class Freighter extends NPShip {
    constructor(location) {
        super(5, 10, 20, location, undefined, HP);
        this.ai = new FreighterAI(this);
    }
    
    // Build/Rebuild ship components.
    buildShip() {
        // Create hull
        // Will also create all other components, for that hull type, and add them to our components sets.
        super.buildShip(LargeHull);
    }

    getClass() {
        return ("Freighter");
    }
}

export default Freighter;