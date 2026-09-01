// Police hull
//
// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import SmallHull from './smallHull.js';
import MediumEngine from '../Engines/mediumEngine.js';
import DumbMissileWeapon from '../Weapons/dumbMissileWeapon.js';
import LaserBeamWeapon from '../Weapons/LaserBeamWeapon.js';
import { ComponentType } from '../component.js';

const DESCRIPTION = "Modified small hull used by the police.";

class PoliceHull extends SmallHull {

    static type = new ComponentType("GP1P", 5, 50, 1000, 3);

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }

    buildShip(ship) {
        // Do stuff common for all hulls.
        super.buildShip(ship);

        // Modify for police use.
        this.compSets.engineSet.clear();
        new MediumEngine(this.compSets.engineSet);
        
        this.compSets.weaponSet.clear();
        new LaserBeamWeapon(this.compSets.weaponSet);

        this.recalc();
    }
}

export default PoliceHull;