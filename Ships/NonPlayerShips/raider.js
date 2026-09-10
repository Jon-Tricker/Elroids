// Non player raider. Attacks player ship.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import NPShip from './nonPlayerShip.js';
import SmallHull from '../Components/Hulls/smallHull.js';
import MediumEngine from '../Components/Engines/mediumEngine.js';
import BasicBay from '../Components/Bays/basicBay.js';
import DumbMissileWeapon from '../Components/Weapons/dumbMissileWeapon.js';
import { BasicAI } from './basicAI.js';

class RaiderAI extends BasicAI {

    // See extensive comment in parent class.
    hostileProgram(date) {
        let done = false;

        switch (this.pc) {
            case 0:
                done = this.attackShip(date);
                break; 

            case 1:
                done = this.navToRandomLocation(date);
                break;
                
            case 2:
                done = this.navToWormhole(date);
                break;

            // Loop forever.
            default:
                this.pc = 0;
                break;
        }

        return(done);
    }
}

const HP = 3;

class Raider extends NPShip {
    constructor(location, speed) {
        super(5, 10, 20, location, speed, undefined, HP);
        this.ai = new RaiderAI(this);
        this.buildShip();
        this.setHostile(true);
    }   
    
    buildShip() { 
        this.hull = new SmallHull(this.compSets.hullSet); 
        this.hull.setSlots(this.compSets);
        
        // Do custom stuff for this hull
        new MediumEngine(this.compSets.engineSet);
        new DumbMissileWeapon(this.compSets.weaponSet);
        new BasicBay(this.compSets.baySet);

        this.recalc();
    }
}

export default Raider;