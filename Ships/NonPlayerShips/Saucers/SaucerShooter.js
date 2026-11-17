// Random shooting saucer.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Game from '../../../Game/game.js';
import Utils from '../../../Game/Utils/utilities.js';
import { Saucer, SaucerAI } from './Saucer.js';
import SaucerHull from '../../Components/Hulls/saucerHull.js';
import BasicEngine from '../../Components/Engines/basicEngine.js';
import DumbMissileWeapon from '../../Components/Weapons/dumbMissileWeapon.js';
import { Color } from 'three';
import BasicBay from '../../Components/Bays/basicBay.js';

const COLOUR = new Color("#C0C0C0");

const STANDOFF_DISTANCE = 300;
const SHOOT_FREQUENCY = 2000;   // m/s

const INITIAL_CARGO_VALUE = 80;

class ShooterAI extends SaucerAI {

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

            case 1:
                // Fire in random direction.
                let range = this.myShip.location.getRelative(Game.getGame().getShip().location);
                if ((STANDOFF_DISTANCE * 2) > range.length()) {
                    // Fire
                    let dir = Utils.createRandomVector(1);

                    this.myShip.shoot(undefined, dir);
                    done = true;
                } else {
                    // Out of range ... relocate.
                    this.dest = undefined;
                    this.pc = 0;
                }
                break;

            case 2:
                // Wait a while.
                done = this.wait(date, SHOOT_FREQUENCY);
                break;

            case 3:
                // Occasionally explode
                if (Math.random() < 0.01) {
                    this.myShip.explode();
                    break;
                }

                // Occasionally re-locate.
                if (Math.random() > 0.1) {
                    this.dest = undefined;
                    this.pc = 1;
                } else {
                    done = true;
                }
                break;

            // Loop forever.
            default:
                this.dest = undefined;
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

class SaucerShooter extends Saucer {
    constructor(location, speed) {
        super(20, location, speed);

        this.ai = new ShooterAI(this);
    }

    buildShip() {
        this.hull = new SaucerHull(this.compSets.hullSet, COLOUR);
        this.hull.setSlots(this.compSets);

        // Do custom stuff for this hull
        new BasicEngine(this.compSets.engineSet);
        new DumbMissileWeapon(this.compSets.weaponSet);
        new BasicBay(this.compSets.baySet);

        this.compSets.baySet.loadRandomCargo(INITIAL_CARGO_VALUE);

        this.recalc();
    }

    getName() {
        return ("Shooter");
    }
}

export default SaucerShooter;