// Player

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

class Player {
    score;
    credits;

    constructor(score, credits) {
        if (undefined === score) {
            this.score =0;
            this.credits = 0;
        } else {
            this.score = score;
            this.credits = credits;
        }
    }

    toJSON() {
        return{
            score: this.score,
            credits: this.credits
        }
    }

    static fromJSON(json) {
        return(new Player(json.score, json.credits));
    }

    getScore() {
        return (this.score);
    }  
    
    getCredits() {
        return (this.credits);
    }

    // Loose a life. Return 'true' if still some left.
    killed() {
        // Now only one life.
        return (false);
    }

    addCredits(credits) {
        if (0 < credits) {
            this.score += credits;
        }
        this.credits += credits;
    }

}

export default Player;