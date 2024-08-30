// Basic cargo bay

import Bay from './bay.js'

const DESCRIPTION = "The smallest available cargo bay";

class BasicBay extends Bay {

    constructor(ship) {
        super("Miniskip", 1, 10, 100, 3, ship,  25);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.name + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default BasicBay;