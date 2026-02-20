// Static utility for creating non player ships.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import JSONSet from "../../Game/Utils/jsonSet.js";
import Freighter from "./freighter.js";
import Smuggler from "./smuggler.js";
import Raider from "./raider.js";
import Miner from "./miner.js";

class NPShipFactory {

    // List of all ship types.
    // JSONSet is used for it's utilities. It is not stored as JSON.
    static shipTypes = new JSONSet ([Freighter, Smuggler, Raider, Miner]);
    // static shipTypes = new JSONSet ([Miner]);

    // Create a random ship
    static createRandom(location, moving) {
        let type = this.shipTypes.getRandomElement();
        let ship = this.createShip(type, location, moving);
        return(ship);
    }

    static createShip(type, location, moving) {
        let ship = new type(location);

        // Rotate to a random angle.
        let angle = (Math.random() - 0.5) * 2 * Math.PI;
        ship.rotateX(angle);

        angle = (Math.random() - 0.5) * 2 * Math.PI;
        ship.rotateY(angle);     
        
        angle = (Math.random() - 0.5) * 2 * Math.PI;
        ship.rotateZ(angle);

        if ((undefined != moving) && moving) {
            // Max speed forward.
            let speed = ship.getOrientation();
            speed.multiplyScalar(ship.getMaxSpeed());

            ship.setSpeed(speed);
        }

        return(ship);
    }
}

export default NPShipFactory;