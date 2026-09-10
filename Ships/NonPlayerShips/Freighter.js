// Non player freighter. Starts with cargo takes it to the station via a random location.

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import NPShip from './nonPlayerShip.js';
import LargeHull from '../Components/Hulls/largeHull.js';
import BasicEngine from '../Components/Engines/basicEngine.js';
import DumbMissileWeapon from '../Components/Weapons/dumbMissileWeapon.js';
import MediumBay from '../Components/Bays/mediumBay.js';
import { BasicAI } from './basicAI.js';

class FreighterAI extends BasicAI {
}

const HP = 3;
const INITIAL_CARGO_VALUE = 2000;

class Freighter extends NPShip {
    constructor(location, speed) {
        super(5, 10, 20, location, speed, undefined, HP);

        this.buildShip();

        this.ai = new FreighterAI(this);

        this.compSets.baySet.loadRandomCargo(Math.random() * INITIAL_CARGO_VALUE);
    }

    buildShip() {
        this.hull = new LargeHull(this.compSets.hullSet);
        this.hull.setSlots(this.compSets);

        // Do custom stuff for this hull
        new BasicEngine(this.compSets.engineSet);
        new BasicEngine(this.compSets.engineSet);
        new DumbMissileWeapon(this.compSets.weaponSet);
        new MediumBay(this.compSets.baySet);
        //new BasicRadar(this.compSets.avionicsSet);
        //new BasicCompass(this.compSets.avionicsSet);
        //new BasicHud(this.compSets.avionicsSet);
        // new RangeHud(this.compSets.avionicsSet);
        // new MiningHud(this.compSets.avionicsSet);

        this.recalc();
    }
}

export default Freighter;