// Saucer that rams player ship..

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Game from '../../../Game/game.js';
import { Saucer2, Saucer2AI } from './Saucer2.js';
import Saucer2Hull from '../../Components/Hulls/saucer2Hull.js';
import BasicEngine from '../../Components/Engines/basicEngine.js';
import { Color } from 'three';

const COLOUR = new Color("#C03030");

const INITIAL_CARGO_VALUE = 80;

class RammerAI extends Saucer2AI {

    // See extensive comment in parent class.
    hostileProgram(date) {
        let done = false;

        switch (this.pc) {

            case 0:
                // Move to location.
                this.dest = Game.getGame().getShip();
                done = this.navigateThrough(this.getTargetLocation(this.dest));
                break;

            // Loop forever. Should never get here.
            default:
                this.pc = 0;
                break;
        }

        if (done) {
            this.incPc();
        }
    }
}

class Saucer2Rammer extends Saucer2 {
    constructor(location, speed) {
        super(20, location, speed);

        this.ai = new RammerAI(this);
    }

    buildShip() {
        this.hull = new Saucer2Hull(this.compSets.hullSet, COLOUR);
        this.hull.setSlots(this.compSets);

        // Do custom stuff for this hull
        new BasicEngine(this.compSets.engineSet);

        this.recalc();
    }

    getName() {
        return("Rammer");
    }
}

export default Saucer2Rammer;