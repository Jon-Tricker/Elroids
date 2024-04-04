// Random shooting saucer.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import DumbMissile from '../dumbMissile.js';
import Saucer from './saucer.js';
import Universe from '../../universe.js';

const COLOUR = "#F0C0C0";
const SIZE = 10;
const MASS = 50;

const MAX_SPEED = 75;
const MAX_ACC = 3;

const SHOOT_FREQUENCY = 100;
const MOVE_FREQUENCY = 1010;
const STANDOFF_DISTANCE = 500;

class SaucerShooter extends Saucer {
    shootDue = 0;
    moveDue = 0;
    targetLocation;

    constructor(locationX, locationY, locationZ, game, owner, safe) {
        super(SIZE, locationX, locationY, locationZ, game, MASS, COLOUR, owner, safe);
        this.createTargetLocation();
    }
    
    getMaxSpeed() {
        return(MAX_SPEED);
    }
    
    createTargetLocation() {
        this.targetLocation = this.game.getShip().location.clone();

        let offset = this.game.createRandomVector(STANDOFF_DISTANCE)
        this.targetLocation.add(offset);
    }

    // Do navigation logic. Home to near the ship.
    navigate() {
        let targetSpeed = this.getRelativePosition(this.targetLocation);

        targetSpeed.normalize();
        targetSpeed.multiplyScalar(MAX_SPEED);

        let delta = targetSpeed.clone();
        delta.sub(this.speed);

        if (delta.length() > MAX_ACC/Universe.getAnimateRate()) {
            delta.normalize;
            delta.multiplyScalar(MAX_ACC/Universe.getAnimateRate());
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
                this.shootDue = 0;

                // Only fire if vaguley close enough.
                let range = this.getRelativePosition(this.game.getShip().location);
                range.multiplyScalar(-1);
                if ((STANDOFF_DISTANCE * 2) > range.length()) {
                    let direction = this.game.createRandomVector(2);
                    new DumbMissile(direction, this);
                }
            }
        }
    }

    getScore() {
        return (30);
    }
}

export default SaucerShooter;