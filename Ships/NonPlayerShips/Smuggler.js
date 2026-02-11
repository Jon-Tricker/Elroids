// Non player smuggler. Picks up valuables and takes them to the station.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import NPShip from './nonPlayerShip.js';
import MediumHull from '../Components/Hulls/mediumHull.js';
import { BasicAI } from './basicAI.js';

class SmugglerAI extends BasicAI {

    // See extensive comment in parent class.
    program(date) {
        let done = false;

        switch (this.pc) {
            case 0:
                // Hunt cargo until have some.
                if (this.myShip.getCargoBay().getContentMass() < (this.myShip.getCargoBay().getCapacity() / 2)) {
                    done = this.navToCargo(date);
                } else {
                    // Go and unload it.
                    done = true;
                }
                break;

            case 1:
                done = this.navToApproachPoint(date);
                break;

            case 2:
                done = this.dock(date);
                break;

            case 3:
                // Unload cargo.
                this.myShip.getCargoBay().empty();
                done = true;
                break;

            case 4:
                // Wait a while
                done = this.wait(date);
                break;

            case 5:
                // Undock.
                done = this.undock(date);
                break;

            case 6:
                // Decide what to do next.
                if (Math.random() < 0.5) {
                    // Warp out
                    done = true;
                } else {
                    // If there is some cargo loop back and pick it up.
                    if (null != this.myShip.location.system.getValuable(undefined, this.myShip.location)) {
                        // Loop.
                        this.pc = 0;
                    } else {
                        done = true;
                    }
                }
                break;

            case 7:
                done = this.navToWormhole(date);
                break;

            // Loop forever.
            default:
                this.pc = 0;
                break;
        }

        if (done) {
            this.incPc();
        }
    }
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