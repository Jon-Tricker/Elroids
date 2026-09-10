// Non player ship graphic and physics.
// Minumum necessary implemented.

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Game from '../../Game/game.js';
import Ship from '../ship.js';

class NPShip extends Ship {

    // Brain of NP ship.
    ai;

    constructor(height, width, length, location, speed, mass, hitPoints) {
        super(height, width, length, location, speed, mass, hitPoints);
    }

    destruct() {
        super.destruct();
    }

    animate(date, keyboard) {
        // Move, at existing speed, first so we don't run over anything created.
        super.animate(date);
        
        this.ai.animate(date);
    }

    takeDamage(hits, that) {
        let destroyed = super.takeDamage(hits, that);

        if (that.owner == this.getShip()) {
            if (!this.isHostile() && (this.getSystem().getLawLevel() > 1) ) {
                Game.getGame().displays.addMessage("Piracy is illegal. Reputation reduced.");
                this.getShip().getPlayer().decReputation();
            }

            // Now it's war!
            Game.getGame().setSafe(false);
            this.setHostile(true);
        }

        if (destroyed) {
            // Dump all cargo.
            this.compSets.baySet.dumpAll();
            this.recalc();
        }

        return (destroyed);
    }

    isHostile() {
        return(this.ai.isHostile())
    }

    setHostile(hostile) {
        this.ai.setHostile(hostile);
    }

    getRadarColour() {
        if (this.isHostile()) {
            return("#FF0000")
        } else {
            return(super.getRadarColour());
        }
    }
}

export default NPShip;