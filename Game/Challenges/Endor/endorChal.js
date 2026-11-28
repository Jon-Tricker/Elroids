// Escape from Endor challenge.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Game from "../../game.js";
import Challenge from "../challenge.js";

class EndorChal extends Challenge {
    name = "Escape from Endor";           // Challenge name.

    // Starting conditions
    system = "Endor";        // Staring start system
    damage = 55;             // Starting ship damage (%)
    docked = true;           // Start docked?
    reputation = 0.2;          // Starting rep.

    // Check if challenge completed.
    // Normally part of animate loop.
    isComplete() {
        let dockedWith =  Game.getGame().getShip().getDockedWith();
        if ((undefined != dockedWith) && ("Endor" != dockedWith.location.system.spec.name)) {
            return(true);
        }
        return (false);
    }
}

export default EndorChal;