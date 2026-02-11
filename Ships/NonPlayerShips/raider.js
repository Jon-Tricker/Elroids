// Non player raider. Attacks player ship.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import NPShip from './nonPlayerShip.js';
import BasicHull from '../Components/Hulls/basicHull.js';
import { BasicAI } from './basicAI.js';

class RaiderAI extends BasicAI {

    // See extensive comment in parent class.
    hostileProgram(date) {
        let done = false;

        switch (this.pc) {
            case 0:
                done = this.attackShip(date);
                break; 

            case 1:
                done = this.navToRandomLocation(date);
                
            case 2:
                done = this.navToWormhole(date);
                break;

            // Loop forever.
            default:
                this.pc = 0;
                break;
        }

        return(done);
    }
}

const HP = 3;

class Raider extends NPShip {
    constructor(location) {
        super(5, 10, 20, location, undefined, HP);
        this.ai = new RaiderAI(this);
        this.setHostile(true);
    }

    // Build/Rebuild ship components.
    buildShip() {
        // Create hull
        // Will also create all other components, for that hull type, and add them to our components sets.
        super.buildShip(BasicHull);
    }

    getClass() {
        return ("Raider");
    }
}

export default Raider;