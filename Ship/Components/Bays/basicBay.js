// Basic cargo bay

import Bay from './bay.js'

class BasicBay extends Bay {

    constructor(ship) {
        super("Miniskip", 10, 100, 3, ship,  25);
    }
}

export default BasicBay;