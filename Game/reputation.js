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
    canDock;        // Can ship dock.
    attack;         // Police will attack.

    static MAX_REPUTATION = 1;
    static REP_INC_COST=1000;

    constructor(text, minDiff, canDock, attack) {
        this.text = text;
        this.minDiff = minDiff;
        this.canDock = canDock;
        this.attack = attack;
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

    getAttack() {
        return(this.attack);
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
        new Reputation("Excellent", 1, true, false),
        new Reputation("Good", 0, true, false),
        new Reputation("Poor", -1, true, false),
        new Reputation("Criminal", -2, false, false),
        new Reputation("Outlaw", -3, false, true)
    ]);

}

export default Reputation;