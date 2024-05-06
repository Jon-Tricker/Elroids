// Player

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

class Player {
    score = 0;
    credits = 0;

    constructor() {
    }

    getScore() {
        return (this.score);
    }  
    
    getCredits() {
        return (this.credits);
    }

    // Loose a life. Return 'true' if still some left.
    killed() {
        return (false);
    }

    addCredits(score) {
        if (0 < score) {
            this.score += score;
        }
        this.credits += score;
    }

}

export default Player;