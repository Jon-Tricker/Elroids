// Basic hull

import Hull from './hull.js'

class BasicHull extends Hull {

    constructor(ship) {
        super("GP1", 50, 1000, 3, ship, 5, 200);
    }
}

export default BasicHull;