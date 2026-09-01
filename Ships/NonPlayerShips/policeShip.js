// Non player police ship.

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NPShip from './nonPlayerShip.js';
import PoliceHull from '../Components/Hulls/policeHull..js';
import Reputation from '../../Game/reputation.js';
import Saucer from '../../GameItems/Saucers/saucer.js';
import { BasicAI } from './basicAI.js';

class PoliceAI extends BasicAI {

    // See extensive comment in parent class.
    program(date) {
        let done = false;

        switch (this.pc) {
            case 0:
                // Work out what to do
                if (Math.random() < 0.5) {
                    this.dest = this.myShip.location.system.getClosest(Saucer,  this.myShip.location);
                    if (undefined != this.dest) {
                        this.pc = 2;
                        break;
                    }
                }

                done = true;
                break;

            case 1:
                // Patrol
                done = this.navToRandomLocation(date);
                if (done) {
                    this.pc = 3;
                }
                break;

            case 2:
                // Hunt saucer.
                if (this.dest.isDestructed()) {
                    done = true;
                    break;
                }
                done = this.attack(this.dest, date);
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

    // See extensive comment in parent class.
    hostileProgram(date) {
        let done = false;

        switch (this.pc) {
            case 0:
                done = this.attackShip(date);
                break; 

            case 1:
                this.setHostile(false);
                done = this.navToRandomLocation(date);
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

class PoliceShip extends NPShip {
    constructor(location, speed) {
        super(5, 10, 20, location, speed, undefined, HP);
        this.ai = new PoliceAI(this);
        this.recalcHostility();
        this.location.system.addPolice(this);
    }

    destruct() {
        this.location.system.deletePolice(this);
        super.destruct();
    }

    // Build/Rebuild ship components.
    buildShip() {
        // Create hull
        // Will also create all other components, for that hull type, and add them to our components sets.
        super.buildShip(PoliceHull,  new THREE.Color(0x4040FF));
    }

    getClass() {
        return ("Police ship");
    }

    recalcHostility() {
        let system = this.getLocation().system;
        let player = system.getGame().getPlayer();
        let rep = Reputation.getRepInSystem(player, system);
        super.setHostile(rep.getAttack());
    }
}

export default PoliceShip;