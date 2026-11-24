// Non player police ship.

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NPShip from './nonPlayerShip.js';
import Reputation from '../../Game/reputation.js';
import { Saucer } from './Saucers/Saucer.js';
import SmallHull from '../Components/Hulls/smallHull.js';
import MediumEngine from '../Components/Engines/mediumEngine.js';
import LaserBeamWeapon from '../Components/Weapons/laserBeamWeapon.js';
import { BasicAI } from './basicAI.js';
import Game from '../../Game/game.js';
import Utils from '../../Game/Utils/utilities.js';

const STANDOFF_DISTANCE = 500;

class PoliceAI extends BasicAI {

    // See extensive comment in parent class.
    program(date) {
        let done = false;

        switch (this.pc) {
            case 0:
                // Work out what to do
                if (Math.random() < 0.5) {
                    this.dest = this.myShip.location.system.getClosest(Saucer, this.myShip.location);
                    if (undefined != this.dest) {
                        this.pc = 3;
                        break;
                    }
                }

                done = true;
                break;

            case 1:
                this.dest = this.createPatrolLocation();
                done = true;
                break;

            case 2:
                // Patrol
                done = this.navigateThrough(this.dest);
                if (done) {
                    this.pc = 4;
                }
                break;

            case 3:
                // Hunt saucer.
                done = this.attack(this.dest, date);
                break;

            // Loop forever.
            default:
                this.pc = 0;
                break;
        }

        return (done);
    } 
    
    // Create position near ship.
    createPatrolLocation() {

        if (Math.random() > 0.5) {
            // Sometimes go to random location
            return(Utils.createRandomVector(this.myShip.location.system.systemSize));
        }

        // Sometimes lurk near 
        let pos = this.myShip.location.system.stations.values().next().value.getLocation().clone();
        let offset = Utils.createRandomVector(STANDOFF_DISTANCE)
        pos.add(offset);

        return (pos);
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
        return (done);
    }

}

const HP = 3;

class PoliceShip extends NPShip {
    constructor(location, speed) {
        super(5, 10, 20, location, speed, HP);

        this.ai = new PoliceAI(this);

        this.recalcHostility();
    }

    buildShip() {
        this.hull = new SmallHull(this.compSets.hullSet, new THREE.Color(0x4040FF) );
        this.hull.setSlots(this.compSets);

        new MediumEngine(this.compSets.engineSet);
        new LaserBeamWeapon(this.compSets.weaponSet);

        this.recalc();
    }

    getName() {
        return ("Police ship");
    }

    recalcHostility() {
        let system = this.getLocation().system;
        let player = Game.getGame().getPlayer();
        let rep = Reputation.getRepInSystem(player, system);
        super.setHostile(rep.getAttack());
    }
}

export default PoliceShip;