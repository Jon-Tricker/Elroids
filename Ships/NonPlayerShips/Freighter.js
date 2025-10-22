// Non playet freighter.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import NPShip from './NonPlayerShip.js';
import BasicHull from '../Components/Hulls/basicHull.js';
import MediumHull from '../Components/Hulls/mediumHull.js';
import LargeHull from '../Components/Hulls/largeHull.js';
import BasicAI from './BasicAI.js';

class FreighterAI extends BasicAI {
    constructor(myShip) {
        super(myShip);
    }
}

const HP = 3;
const MASS = 100;
const THRUST = 5000;

class Freighter extends NPShip {
    constructor(system, location) {

        // Pick a random hull type.
        let hullType = null;
        switch (Math.floor(Math.random() * 3)) {
            case 0:
                hullType = BasicHull;
                break;    
                
            case 1:
                hullType = MediumHull;
                break;

            default:
                hullType = LargeHull;
                break;
        }

        super(system, 5, 10, 20, location, hullType, MASS, HP);
        this.ai = new FreighterAI(this);
    }

    getClass() {
        return ("Freighter");
    }

    getThrust() {
        return(THRUST);
    }
}

export default Freighter;