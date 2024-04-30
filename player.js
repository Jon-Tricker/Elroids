// Player

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

class Player {
    score;

    constructor() {
        this.score = 0;
    }

    getScore() {
        return (this.score);
    }

    // Loose a life. Return 'true' if still some left.
    killed() {
        return (false);
    }

    addScore(score) {
        this.score += score;
    }

}

export default Player;