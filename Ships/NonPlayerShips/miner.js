// Non player miner. Blows up rocks, recovers minerals and takes them to the station.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import NPShip from './nonPlayerShip.js';
import MediumHull from '../Components/Hulls/mediumHull.js';
import { BasicAI } from './basicAI.js';
import Rock from '../../GameItems/rock.js';
import Mineral from '../../GameItems/mineral.js';

class MinerAI extends BasicAI {

    // See extensive comment in parent class.
    program(date) {
        let done = false;
        let ship = this.myShip;

        switch (this.pc) {
            case 0:
                done = this.navToRandomLocation(date);
                break;

            case 1:
                // Work out what to hunt.
                let rock = this.myShip.location.system.getValuable(Rock, this.myShip.location, true);
                let mineral = this.myShip.location.system.getValuable(Mineral, this.myShip.location, false);

                if (null != mineral) {
                    // Is mineral worth more than rock (X10 because extracted mineral easier to get)
                    if ((null == rock) || (rock.getRelativeValue(ship.getLocation()), true) < (mineral.getRelativeValue(ship.getLocation(), false))) {
                        this.dest = mineral;
                        this.pc = 2;
                        break;
                    }
                }

                if (null != rock) {
                    this.dest = rock;
                    this.pc = 3;
                } else {
                    // Nothing to do.
                    this.pc = 0;
                }

                break;

            case 2:
                // Hunt mineral
                if (this.navigateThroughDest(this.dest)) {
                    // Look for something new,
                    this.pc = 4;
                }
                break;

            case 3:
                // Attack rock.
                done = this.attack(this.dest, date);
                break;

            case 4:
                // Check if worth offloading.
                if (ship.getCargoBay().getContentMass() < (ship.getCargoBay().getCapacity() / 2)) {
                    // Look for more
                    this.pc = 1;
                    break;
                }

                // Go and unload it.
                done = true;

                break;

            case 5:
                done = this.navToApproachPoint(date);
                break;

            case 6:
                done = this.dock(date);
                break;

            case 7:
                // Unload cargo.
                this.myShip.getCargoBay().empty();
                done = true;
                break;

            case 8:
                // Wait a while
                done = this.wait(date);
                break;

            case 9:
                // Undock.
                done = this.undock(date);
                break;

            case 10:
                // Decide what to do next.
                if (Math.random() < 0.3) {
                    // Warp out
                    done = true;
                } else {
                    this.pc = 0;
                }
                break;

            case 11:
            default:
                done = this.navToWormhole(date);
                break;
        }

        if (done) {
            this.incPc();
        }
    }
}

const HP = 3;

class Miner extends NPShip {
    constructor(location) {
        super(5, 10, 20, location, undefined, HP);
        this.ai = new MinerAI(this);
    }

    // Build/Rebuild ship components.
    buildShip() {
        // Create hull
        // Will also create all other components, for that hull type, and add them to our components sets.
        super.buildShip(MediumHull);
    }

    getClass() {
        return ("Miner");
    }
}

export default Miner;