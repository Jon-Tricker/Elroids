// Static utility for creating non player ships.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import JSONSet from "../../Utils/jsonSet.js";
import Freighter from "./Freighter.js";

class NPShipFactory {

    // List of all ship types.
    // JSONSet is used for it's utilities. It is not stored as JSON.
    static shipTypes = new JSONSet ([Freighter]);

    // Create a random ship
    static createRandom(system, location) {
        let type = this.shipTypes.getRandomElement();
        let ship = new type(system, location);
        return(ship);
    }
}

export default NPShipFactory;