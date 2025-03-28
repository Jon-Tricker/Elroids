// Shooting saucer that tries to target the ship.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import DumbMissile from '../dumbMissile.js';
import Saucer from './saucer.js';

const COLOUR = "#008000";
const SIZE = 20;  
const MASS = 50;

const MAX_SPEED = 150;   // m/s
const MAX_ACC = 5;    // m/s^2

const SHOOT_FREQUENCY = 200;
const MOVE_FREQUENCY = 2010;
const STANDOFF_DISTANCE = 400;

const BURST_COUNT = 3;

class SaucerHunter extends Saucer {
    shootDue = 0;
    moveDue = 0;
    targetLocation;

    burstCounter = 0;

    constructor(system, locationX, locationY, locationZ, owner, safe) {
        super(system, SIZE, locationX, locationY, locationZ, MASS, COLOUR, owner, safe);
        this.createTargetLocation();
    }

    getMaxSpeed() {
        return(MAX_SPEED);
    }

    createTargetLocation() {
        this.targetLocation = this.getShip().location.clone();

        let offset = this.getGame().createRandomVector(STANDOFF_DISTANCE)
        this.targetLocation.add(offset);
    }

    // Do navigation logic. Home to near the ship.
    // Should really call this.thrust() ... but cheat.
    navigate() {
        let targetSpeed = this.targetLocation.clone();
        targetSpeed.sub(this.location);

        targetSpeed.normalize();
        targetSpeed.multiplyScalar(MAX_SPEED);

        let delta = targetSpeed.clone();
        delta.sub(this.speed);

        let ar = this.getGame().getAnimateRate();
        if (delta.length() > MAX_ACC/ar) {
            delta.normalize;
            delta.multiplyScalar(MAX_ACC/ar);
        }

        let newSpeed = this.speed.clone();
        newSpeed.add(delta);
        this.setSpeed(newSpeed);

        // Occasionally re-position
        if (this.moveDue++ >= MOVE_FREQUENCY) {
            this.moveDue = 0;
            this.createTargetLocation();
        }
    }

    // Do shooting logic
    shoot() {
        if (!this.safe) {
            if (this.shootDue++ >= SHOOT_FREQUENCY) {
                if (this.burstCounter > 0) {
                    if (--this.burstCounter == 0) {
                        // Wait again
                        this.shootDue = 0;
                    }
                } else {
                    this.burstCounter = Math.floor(1 + (Math.random() * BURST_COUNT));
                }

                // Only fire if vaguley close enough.
                let range = this.getRelativeLocation(this.getGame().getShip().location);

                if ((STANDOFF_DISTANCE * 2) > range.length()) {
                    range.normalize();

                    // Add a bit of varience
                    range.x *= 1 + Math.random() * 0.1;
                    range.y *= 1 + Math.random() * 0.1;
                    range.z *= 1 + Math.random() * 0.1;

                    new DumbMissile(range, this);
                }
            }
        }
    }

    getScore() {
        return (80);
    }
}

export default SaucerHunter;