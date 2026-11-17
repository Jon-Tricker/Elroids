// Pirate saucer. Nicks stuff.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Game from '../../../Game/game.js';
import Utils from '../../../Game/Utils/utilities.js';
import { Saucer, SaucerAI } from './Saucer.js';
import SaucerHull from '../../Components/Hulls/saucerHull.js';
import BasicEngine from '../../Components/Engines/basicEngine.js';
import { Color } from 'three';
import BasicBay from '../../Components/Bays/basicBay.js';
import LaserBeamWeapon from '../../Components/Weapons/laserBeamWeapon.js';

const COLOUR = new Color("#4040B0");

const STANDOFF_DISTANCE = 500;
const SHOOT_FREQUENCY = 2000;   // m/s

const MIN_LOOT_VALUE = 50;      // Min value for loot to be interesting.
const MIN_RUN_MASS = 10;        // Min mass of loot befor running.

const INITIAL_CARGO_VALUE = 100;

class PirateAI extends SaucerAI {

    // Target loot.
    // See extensive comment in parent class.
    hostileProgram(date) {
        let done = false;

        switch (this.pc) {

            case 0:
                // Get new location if reqd.
                if (undefined == this.dest) {
                    this.dest = this.createTargetLocation();
                }

                // Move to location.
                done = this.navigateThrough(this.getTargetLocation(this.dest));
                break;

            // Look for loot.
            case 1:
                // Find a new target
                let loot = this.myShip.location.system.getValuable(undefined, this.location);
                if ((undefined != loot) && (MIN_LOOT_VALUE < loot.getValue())) {
                    this.dest = loot;
                    done = true;
                } else {
                    // Occasionaly re-locate.
                    if (Math.random() < 0.1) {
                        this.pc = 0;
                    }
                }

                break;

            // Go get the loot.
            case 2:
                if ((undefined == this.dest) || this.dest.isDestructed()) {
                    // It's gone. Maybe got it.
                    this.dest = undefined;
                    done = true;
                } else {
                    done = this.navigateThrough(this.getTargetLocation(this.dest));
                }

                break;

            // Check if we have enough loot.
            case 3:
                if (MIN_RUN_MASS > this.myShip.compSets.baySet.getContentMass()) {
                    this.pc = 0;
                }
                done = true;
                break;

            // Run
            case 4:
                this.dest = this.myShip.location.system.getWormholeEnds().get(0);
                done = this.navigateThrough(this.getTargetLocation(this.dest));

                // If ship too close fire at it.
                if (this.wait(date, SHOOT_FREQUENCY)) {
                    let dir = this.myShip.location.getRelative(Game.getGame().getShip().location);

                    if ((STANDOFF_DISTANCE) > dir.length()) {
                        // Add a bit of varience
                        let delta = Utils.createRandomVector(0.05);
                        delta.add(new THREE.Vector3(1, 1, 1));
                        dir.multiply(delta);

                        this.myShip.shoot(date, dir);
                    }
                }
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

    // Create position near ship.
    createTargetLocation() {
        let pos = Game.getGame().getShip().getLocation().clone();

        let offset = Utils.createRandomVector(STANDOFF_DISTANCE)
        pos.add(offset);

        return (pos);
    }
}

class SaucerPirate extends Saucer {
    constructor(location, speed) {
        super(20, location, speed);

        this.ai = new PirateAI(this);
    }

    buildShip() {
        this.hull = new SaucerHull(this.compSets.hullSet, COLOUR);
        this.hull.setSlots(this.compSets);

        // Do custom stuff for this hull
        new BasicEngine(this.compSets.engineSet);
        new LaserBeamWeapon(this.compSets.weaponSet);
        new BasicBay(this.compSets.baySet);

        this.compSets.baySet.loadRandomCargo(INITIAL_CARGO_VALUE);

        this.recalc();
    }

    getName() {
        return ("Pirate");
    }
}

export default SaucerPirate;