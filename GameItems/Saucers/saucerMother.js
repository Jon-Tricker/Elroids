// Mother saucer.
// Spawns other saucers.
// Tries to keep away from ship.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Saucer from './saucer.js';

import SaucerWanderer from "./saucerWanderer.js";
import SaucerShooter from "./saucerShooter.js";
import SaucerRam from "./saucerRam.js";
import SaucerHunter from "./saucerHunter.js";
import SaucerPirate from "./saucerPirate.js";
import Location from '../../Game/Utils/location.js';

const COLOUR = "#80FF80";
const SIZE = 70;
const MASS = 1000;
const MAX_SPEED = 40;     // m/s
const MAX_ACC = 1;      // m/s^s

const START_LAUNCH_FREQUENCY = 300;
const MAX_LAUNCH_FREQUENCY = 100;

class SaucerMother extends Saucer {

    currentLaunchFrequency = START_LAUNCH_FREQUENCY;
    launchDue = this.currentLaunchFrequency;

    constructor(location, owner) {
        super(SIZE, location, MASS, COLOUR, owner);
    }

    toJSON() {
        let json = super.toJSON();
        // json.stationSpecific = ....
        return (json);
    }

    static fromJSON(json, system) {
        let newSaucer = new SaucerMother(Location.fromJSON(json.location, system), system.owner);
        newSaucer.rotateX(json.rotationx);
        newSaucer.rotateY(json.rotationy);
        newSaucer.rotateZ(json.rotationz);
        return (newSaucer);
    }

    getName() {
        return ("Mother Saucer");
    }

    getMaxSpeed() {
        return (MAX_SPEED);
    }

    getRadarColour() {
        return(COLOUR);
    }

    destruct() {
        // Remove self from game.
        this.location.system.removeMotherSaucer(this);

        super.destruct();
    }

    // Do navigation logic
    navigate() {
        if (!this.getGame().isSafe()) {
            let delta = this.getGame().getShip().location.getRelative(this.location);

            if (Math.abs(delta.length) > this.location.system.systemSize) {
                // Safe to slow down
                delta = this.speed.clone();
                delta.multiplyScalar(-0.01);
            } else {
                // Run
                delta.normalize();
                delta.multiplyScalar(MAX_ACC / this.getGame().getAnimateRate());

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
        let game = this.getGame();

        if (!game.isSafe()) {
            if (this.launchDue++ >= this.currentLaunchFrequency) {
                this.launchDue = 0;

                // Get faster with time.
                if (this.currentLaunchFrequency >= MAX_LAUNCH_FREQUENCY) {
                    this.currentLaunchFrequency--;
                }

                if (game.getSystem().saucerCount < game.maxSaucerCount) {
                    let saucer;
                    let thisLoc = this.getLocation();

                    let type = Math.floor(Math.random() * 6)
                    switch (type) {
                        case 0:
                        // saucer = new SaucerStatic(thisLoc.x, thisLoc.y, thisLoc.z, this.getGame(), this.safe);
                        // break;
                        // Don't bother with statics ... fall through.

                        case 1:
                            // Block up a saucer slot with something useless.
                            saucer = new SaucerWanderer(thisLoc, this);
                            break;

                        case 2:
                            saucer = new SaucerShooter(thisLoc, this);
                            break;

                        case 3:
                            saucer = new SaucerHunter(thisLoc, this);
                            break;

                        case 4:
                            saucer = new SaucerPirate(thisLoc, this);
                            break;

                        case 5:
                        default:
                            saucer = new SaucerRam(thisLoc, this);
                            break;
                    }

                    saucer.separateFrom(this);
                }
            }
        }
    }

    getScore() {
        return (400);
    }
}

export default SaucerMother;