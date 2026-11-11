// NPShip based random shooting saucer.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Game from '../../../Game/game.js';
import Utils from '../../../Game/Utils/utilities.js';
import { Saucer2, Saucer2AI } from './Saucer2.js';
import Saucer2Hull from '../../Components/Hulls/saucer2Hull.js';
import BasicEngine from '../../Components/Engines/basicEngine.js';
import DumbMissileWeapon from '../../Components/Weapons/dumbMissileWeapon.js';
import { Color } from 'three';
import LaserBeamWeapon from '../../Components/Weapons/laserBeamWeapon.js';

const COLOUR = new Color("#C0C0C0");

const STANDOFF_DISTANCE = 300;
const SHOOT_FREQUENCY = 2000;   // m/s

class ShooterAI extends Saucer2AI {

    // See extensive comment in parent class.
    hostileProgram(date) {
        let done = false;

        switch (this.pc) {

            case 0:
                // Get new location if reqd.
                if (undefined == this.dest) {
                    // Create position near ship.
                    this.dest = this.createTargetLocation();
                }

                // Move to location.
                done = this.navigateThrough(this.getTargetLocation(this.dest));
                break;

            case 1:
                // Fire in random direction.
                let range = Game.getGame().getShip().location.getRelative(this.myShip.location);
                if ((STANDOFF_DISTANCE * 2) > range.length()) {
                    // Fire
                    let dir = Utils.createRandomVector(1);

                    this.myShip.shoot(date, dir);
                    done = true;
                } else {
                    // Out of range ... relocate.
                    this.pc = 0;
                }
                break;

            case 2:
                // Wait a while.
                done = this.wait(date, SHOOT_FREQUENCY);
                break;

            case 3:
                // Occasionaly re-locate.
                if (Math.random() > 0.1) {
                    this.pc = 1;
                } else {
                    done = true;
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

    createTargetLocation() {
        let pos = Game.getGame().getShip().getLocation().clone();

        let offset = Utils.createRandomVector(STANDOFF_DISTANCE)
        pos.add(offset);

        return (pos);
    }
}

class Saucer2Shooter extends Saucer2 {
    constructor(location, speed) {
        super(20, location, speed, undefined);

        this.ai = new ShooterAI(this);

        // Saucers always angry.
        this.setHostile(true);
    }

    buildShip() {
        this.hull = new Saucer2Hull(this.compSets.hullSet, COLOUR);
        this.hull.setSlots(this.compSets);

        // Do custom stuff for this hull
        new BasicEngine(this.compSets.engineSet);
        new DumbMissileWeapon(this.compSets.weaponSet);

        this.recalc();
    }
}

export default Saucer2Shooter;