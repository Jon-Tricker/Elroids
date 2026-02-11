// Non player ship graphic and physics.
// Minumum necessary implemented.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Ship from '../ship.js';

class NPShip extends Ship {

    // Brain of NP ship.
    ai;

    constructor(height, width, length, location, mass, hitPoints) {
        super(height, width, length, location, mass, hitPoints);

        this.hull.compSets.baySet.loadRandomCargo(100);
    }

    animate(date, keyboard) {
        this.ai.animate(date);
        super.animate(date);
    }

    takeDamage(hits, that) {
        let destroyed = super.takeDamage(hits, that);

        if ((that.owner == this.getShip()) || (that == this.getShip())) {
            // Now it's war!
            this.getGame().setSafe(false);
            this.setHostile(true);
        }

        if (destroyed) {
            // Dump all cargo.
            this.hull.compSets.baySet.dumpAll();
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