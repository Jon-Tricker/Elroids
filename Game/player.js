// Player

// Copyright (C) Jon Tricker 2023, 24, 25, 26.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import GameError from "./gameError.js";
import Reputation from "./reputation.js";

class Player {
    game;
    credits;

    // Reputation (0 - 1 but displayed as 0.xx - 10).
    reputation;

    lastAnimate = 0;

    constructor(game, credits, reputation) {
        this.game = game;
        if (undefined === credits) {
            this.credits = 0;
            this.reputation = 0.40;
        } else {
            this.credits = credits;
            this.reputation = reputation;
        }
    }

    toJSON() {
        return {
            credits: this.credits,
            reputation: this.reputation
        }
    }

    static fromJSON(json, game) {
        return (new Player(game, json.credits, json.reputation));
    }

    animate() {
        let time = this.game.universe.getTime();

        // Gradually increase rep.
        this.incReputation(false, 0.0001 * (time - this.lastAnimate) / 1000);

        this.lastAnimate = time;
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
        this.game.universe.system.recalcPoliceHostility();
        return (true);

        return (false);
    }

    decReputation(inc) {
        if (undefined == inc) {
            inc = 0.01;
        } else {
            inc /= 10;
        }

        if (this.reputation > 0) {
            this.reputation -= inc;
            this.game.universe.system.recalcPoliceHostility();
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
            return (false);
        }

        this.credits += credits;

        // If we can make a noise.
        let display = this.game.displays;
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