// Random shooting saucer.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import DumbMissile from '../dumbMissile.js';
import Saucer from './saucer.js';

const COLOUR = "#F0C0C0";
const SIZE = 10;
const MASS = 50;

const MAX_SPEED = 150;
const MAX_ACC = 3;

const SHOOT_FREQUENCY = 100;
const MOVE_FREQUENCY = 1010;
const STANDOFF_DISTANCE = 300;

const TTL = 60000;

class SaucerShooter extends Saucer {
    shootDue = 0;
    moveDue = 0;
    targetLocation;

    constructor(location, owner) {
        super(SIZE, location, MASS, COLOUR, owner);
        this.createTargetLocation();
    }   

    getName() {
        return("Shooter");
    }

    getTtl() {
        return(TTL);
    }
    
    getMaxSpeed() {
        return(MAX_SPEED);
    }
    
    createTargetLocation() {
        this.targetLocation = this.getShip().getLocation().clone();

        let offset = this.getGame().createRandomVector(STANDOFF_DISTANCE)
        this.targetLocation.add(offset);
    }

    // Do navigation logic. Home to near the ship.
    navigate() {
        let targetSpeed = this.location.getRelative(this.targetLocation);

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
        if (!this.getGame().isSafe()) {
            if (this.shootDue++ >= SHOOT_FREQUENCY) {
                this.shootDue = 0;

                // Only fire if vaguley close enough.
                let game = this.getGame();
                let range = game.getShip().location.getRelative(this.location);
                if ((STANDOFF_DISTANCE * 2) > range.length()) {
                    let direction = game.createRandomVector(2);
                    new DumbMissile(direction, this);
                }
            }
        }
    }

    getScore() {
        return (60);
    }
}

export default SaucerShooter;