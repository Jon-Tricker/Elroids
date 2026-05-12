// Player

// Copyright (C) Jon Tricker 2023, 24, 25, 26.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import GameError from "./gameError.js";
import Reputation from "./reputation.js";

class Player {
    game;
    score;
    credits;

    // Reputation (0 - 99 but displayed as x.x).
    reputation;

    constructor(game, score, credits, reputation) {
        this.game = game;
        if (undefined === score) {
            this.score = 0;
            this.credits = 0;
            this.reputation = 50;
        } else {
            this.score = score;
            this.credits = credits;
            this.reputation = reputation;
        }
    }

    toJSON() {
        return {
            score: this.score,
            credits: this.credits,
            reputation: this.reputation
        }
    }

    static fromJSON(json, game) {
        return (new Player(game, json.score, json.credits, json.reputation));
    }

    getScore() {
        return (this.score);
    }

    getCredits() {
        return (this.credits);
    }

    getReputation() {
        return (this.reputation / 10);
    }

    incReputation() {
        if (this.reputation < Reputation.MAX_REPUTATION) {
            if (!this.addCredits(-Reputation.REP_INC_COST)) {
                return (false);
            }
            this.reputation++;
            return (true);
        }
        return (false);
    }

    decReputation() {
        if (this.reputation > 0) {
            this.reputation--;
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