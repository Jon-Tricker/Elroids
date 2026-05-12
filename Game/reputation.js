// Set of reputation states that the player can have.
//
// Defines how the universe reacts to him.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Player from "./player.js";
import { System } from "../GameItems/System/system.js";

class Reputation {
    text;       
    minDiff;        // Minimum difference from system law level.
    canDock;   // Can ship dock.

    static MAX_REPUTATION = 100;
    static REP_INC_COST=1000;

    constructor(text, minDiff, canDock) {
        this.text = text;
        this.minDiff = minDiff;
        this.canDock = canDock;
    }

    getText() {
        return(this.text);
    }

    getMinDiff() {
        return(this.minDiff);
    }

    getCanDock() {
        return(this.canDock);
    }

    static getRepInSystem(player, system) {
        // Find rep.
        let diff = player.getReputation() - system.getLawLevel();
        let last;
        for (let rep of Reputation.list) {
            if (rep.getMinDiff() <= diff) {
                return(rep);
            } else {
                last = rep;
            }
        }

        // If not found its the last.
        return(last); 
    }


    // List of reputations in order.
    static list = new Set([
        new Reputation("Excellent", 1, true),
        new Reputation("Good", 0, true),
        new Reputation("Poor", -1, true),
        new Reputation("Criminal", -2, false),
        new Reputation("Outlaw", -3, false)
    ]);

}

export default Reputation;