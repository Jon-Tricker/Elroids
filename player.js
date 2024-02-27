// Player

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

import Universe from './universe.js'
import Keyboard from "./keyboard.js";

const DEFAULT_LIVES = 3;

class Player {
    lives;
    score;

    constructor() {
        this.lives = DEFAULT_LIVES;
        this.score = 0;
    }

    getScore () {
        return (this.score);
    }

    getLives() {
        return(this.lives);
    }

    // Loose a life. Return 'true' if still some left.
    killed() {
        this.lives--;
        return (this.lives > 0);
    } 
    
    addScore(score) {
        this.score += score;
    }

}

export default Player;