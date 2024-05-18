// Basic cargo bay

import Bay from './bay.js'

class BasicBay extends Bay {

    constructor(ship) {
        super("Mini Skip", 10, 100, 5, ship, 10);
    }
}

export default BasicBay;