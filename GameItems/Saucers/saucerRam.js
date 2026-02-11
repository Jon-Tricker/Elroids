// kamikaze saucer
// Tries to ram ship.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Saucer from './saucer.js';

const COLOUR = "#FF2020";
const SIZE = 20;
const MASS = 20;
const MAX_SPEED = 100;   // m/s
const MAX_ACC = 5;   // m/s^2

class SaucerRam extends Saucer {
    constructor(location, owner) {
        super(SIZE, location, MASS, COLOUR, owner);
    } 

    getName() {
        return("Rammer");
    }
    
    getMaxSpeed() {
        return(MAX_SPEED);
    }
    // Do navigation logic to ram ship.
    navigate() {
        let targetSpeed = this.getShip().location.getRelative(this.location);

        // In safe mode always miss.
        if (this.getGame().isSafe()) {
            targetSpeed.x += 100;
            targetSpeed.y += 100;
            targetSpeed.z += 100;
        }

        targetSpeed.normalize();
        targetSpeed.multiplyScalar(-MAX_SPEED);

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
    }

    getScore() {
        return (60);
    }
}

export default SaucerRam;