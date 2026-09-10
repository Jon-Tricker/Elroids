// Static utility for creating non player ships.

// Copyright (C) Jon Tricker 2023 - 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import JSONSet from "../../Game/Utils/jsonSet.js";
import Freighter from "./freighter.js";
import Smuggler from "./smuggler.js";
import Raider from "./raider.js";
import Miner from "./miner.js";
import PoliceShip from './policeShip.js';
import Utils from '../../Game/Utils/utilities.js';

class NPShipFactory {

    // List of all ship types.
    // JSONSet is used for it's utilities. It is not stored as JSON.
    static shipTypes = new JSONSet([Freighter, Smuggler, Raider, Miner, PoliceShip]);
    // static shipTypes = new JSONSet ([Freighter, Smuggler, PoliceShip]);

    // Create a random ship
    static createRandom(location, moving) {
        let type;
        // Don't auto create police ships.
        do {
            type = this.shipTypes.getRandomElement();
        } while (type == PoliceShip);

        let ship = this.createShip(type, location, undefined);
        return (ship);
    }

    static createShip(type, location, speed) {

        if (undefined == speed) {
            // Make up a start speed/direction.
            speed = Utils.createRandomVector(100, true);
        }

        let ship = new type(location, speed);

        // Look in direction of travel.
        // Since we have not yet been drawn position = 0,0,0. So don't need to convert to world coords.
        ship.lookAt(speed);
        ship.rotateY(-Math.PI/2)

        return (ship);
    }
}

export default NPShipFactory;