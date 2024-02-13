// Random wandering saucer.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Saucer from './saucer.js';

const COLOUR = "#D0D0FF";
const SIZE = 30;
const MASS = 100;
const MAX_SPEED = 50;

class SaucerWanderer extends Saucer {

    constructor(locationX, locationY, locationZ, game, owner, safe) {
        super(SIZE, locationX, locationY, locationZ, game, MASS, COLOUR, owner, safe);
    }

    getMaxSpeed() {
        return(MAX_SPEED);
    }
    // Do navigation logic
    navigate() {
        let delta = this.game.createRandomVector(2);    
        
        let newSpeed = this.speed.clone();
        newSpeed.add(delta);
        if (newSpeed.length() <= MAX_SPEED) {
            this.setSpeed(newSpeed);
        }
    }   
    
    // Do shooting logic
    shoot() {
    }

    getScore() {
        return(20);
    }
}

export default SaucerWanderer;