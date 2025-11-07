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

        if (destroyed) {
            // Dump all cargo.
            this.hull.compSets.baySet.dumpAll();
            this.recalc();
        }

        return (destroyed);
    }
}

export default NPShip;