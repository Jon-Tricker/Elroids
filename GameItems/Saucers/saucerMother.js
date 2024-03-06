// Mother saucer.
// Spawns other saucers.
// Tries to keep away from ship.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Saucer from './saucer.js';
import Universe from '../../universe.js'

import SaucerWanderer from "./saucerWanderer.js";
import SaucerShooter from "./saucerShooter.js";
import SaucerRam from "./saucerRam.js";
import SaucerHunter from "./saucerHunter.js";
import SaucerPirate from "./saucerPirate.js";

const COLOUR = "#80FF80";
const SIZE = 70;
const MASS = 1000;
const MAX_SPEED = 20;     // m/s
const MAX_ACC = 1;      // m/s^s

const START_LAUNCH_FREQUENCY = 300;
const MAX_LAUNCH_FREQUENCY = 100;

class SaucerMother extends Saucer {

    currentLaunchFrequency = START_LAUNCH_FREQUENCY;
    launchDue = this.currentLaunchFrequency;

    constructor(locationX, locationY, locationZ, game, owner, safe) {
        super(SIZE, locationX, locationY, locationZ, game, MASS, COLOUR, owner, safe);
    }
    
    getMaxSpeed() {
        return(MAX_SPEED);
    }
    destruct() {
        // Remove self from game.
        this.game.removeMotherSaucer();

        super.destruct();
    }

    // Do navigation logic
    navigate() {
        if (!this.safe) {
            let delta = this.getRelativePosition(this.game.getShip().location);

            if (Math.abs(delta.length) > Universe.UNI_SIZE) {
                // Safe to slow down
                delta = this.speed.clone();
                delta.multiplyScalar(-0.01);
            } else {
                // Run
                delta.normalize();
                delta.multiplyScalar(MAX_ACC/Universe.getAnimateRate());

                // Add a bit of randomness. 
                switch (Math.floor(Math.random() * 3)) {
                    case 0:
                        delta.y = 0;
                        delta.z = 0;
                        break;

                    case 1:
                        delta.x = 0;
                        delta.z = 0;
                        break;

                    case 2:
                    default:
                        delta.y = 0;
                        delta.x = 0;
                        break;
                }
            }

            let newSpeed = this.speed.clone();
            newSpeed.add(delta);

            if (newSpeed.length() < MAX_SPEED) {
                this.setSpeed(newSpeed);
            }
        }
    }

    // Do shooting (in our case ship creation) logic
    shoot() {
        if (!this.safe) {
            if (this.launchDue++ >= this.currentLaunchFrequency) {
                this.launchDue = 0;

                // Get faster with time.
                if (this.currentLaunchFrequency >= MAX_LAUNCH_FREQUENCY) {
                    this.currentLaunchFrequency--;
                }

                if (this.game.saucerCount < this.game.maxSaucerCount) {
                    let saucer;

                    let type = Math.floor(Math.random() * 6)
                    switch (type) {
                        case 0:
                        // saucer = new SaucerStatic(this.location.x, this.location.y, this.location.z, this.game, this.safe);
                        // break;
                        // Don't bother with statics ... fall through.

                        case 1:
                            if (this.safe) {
                                // Block up a saucer slot with something useless.
                                saucer = new SaucerWanderer(this.location.x, this.location.y, this.location.z, this.game, this, this.safe);
                                break;
                            }

                        case 2:
                            saucer = new SaucerShooter(this.location.x, this.location.y, this.location.z, this.game, this, this.safe);
                            break;

                        case 3:
                            saucer = new SaucerHunter(this.location.x, this.location.y, this.location.z, this.game, this, this.safe);
                            break; 
                            
                        case 4:
                            saucer = new SaucerPirate(this.location.x, this.location.y, this.location.z, this.game, this, this.safe);
                            break;

                        case 5:
                        default:
                            saucer = new SaucerRam(this.location.x, this.location.y, this.location.z, this.game, this, this.safe);
                            break;
                    }

                    // Match speed and, avoid immediaate collision, move child towards target ship
                    // If this is left in there are frequent collisions betweer mother and child ... so do without.
                    // saucer.speed = this.speed.clone(); 

                    saucer.separateFrom(this);
                }
            }
        }
    }

    getScore() {
        return (200);
    }
}

export default SaucerMother;