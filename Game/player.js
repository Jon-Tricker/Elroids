// Player

// Copyright (C) Jon Tricker 2023, 24, 25, 26.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Game from "./game.js";
import GameError from "./gameError.js";
import Reputation from "./reputation.js";

class Player {
    credits;

    score;
    initialScore;       // Value of starting stuff.

    // Reputation (0 - 1 but displayed as 0.xx - 10).
    reputation;

    lastAnimate = 0;

    constructor(json) {
        if (undefined != json) {
            this.credits = json.credits;
            this.reputation = json.reputation;
            this.initialScore = json.initialScore;
        } else {
            this.credits = 0;
            this.reputation = 0.40;
            // Don't yet know vale of ship. So for now leave initialScore undefined.
        }
    }

    toJSON() {
        return {
            credits: this.credits,
            reputation: Number(this.reputation.toFixed(4)),
            initialScore: this.initialScore
        }
    }

    animate() {
        let time = Game.getGame().universe.getTime();

        // Sort out score.
        if (undefined == this.initialScore) {
            this.initialScore = this.currentScore();
        }
        this.score = this.currentScore();

        // Gradually increase rep.
        this.incReputation(false, 0.0001 * (time - this.lastAnimate) / 1000);

        this.lastAnimate = time;
    }

    getScore() {
        return(this.score)
    }

    // Work out the current score.
    currentScore() {
        // Add credits.
        let sc = this.credits;

        // Add ship value.
        sc += Game.getGame().getShip().compSets.getValue();

        // Don't add goods value ... don't know how mucj they will sell for.
        // sc += Game.getGame().getShip().compSets.baySet.getContentValue();
        
        // Sub starting score.
        if (undefined == this.initialScore) {
            return(Math.floor(sc));
        } else {
            sc -= this.initialScore;
        }

        // Factor reputation
        sc *= 1 + this.getReputation()/25;

        return(Math.floor(sc));
    }


    getCredits() {
        return (this.credits);
    }

    getReputation() {
        return (this.reputation * 10);
    }

    incReputation(charge, inc) {
        if (undefined == inc) {
            inc = 0.01;
        } else {
            inc /= 10;
        }

        if (charge) {
            if (this.reputation < Reputation.MAX_REPUTATION) {
                if (!this.addCredits(-Reputation.REP_INC_COST)) {
                    return (false);
                }
            }
        }

        this.reputation += inc;
        Game.getGame().universe.system.recalcPoliceHostility();
        return (true);
    }

    decReputation(inc) {
        if (undefined == inc) {
            inc = 0.01;
        } else {
            inc /= 10;
        }

        if (this.reputation > 0) {
            this.reputation -= inc;
            Game.getGame().universe.system.recalcPoliceHostility();
            return (true);
        }
        return (false);
    }

    // Loose a life. Return 'true' if still some left.
    killed() {
        // Now only one life.
        return (false);
    }

    // Add/remove credits.
    addCredits(credits) {
        // Check there is enough
        if (-credits > this.credits) {
            throw (new GameError("Not enough credits."));
        }

        this.credits += credits;

        // If we can make a noise.
        let display = Game.getGame().displays;
        if (undefined != display) {
            if (0 < credits) {
                display.terminal.playSound('coin');
            } else {
                display.terminal.playSound('till');
            }
        }

        return (true);
    }

}

export default Player;