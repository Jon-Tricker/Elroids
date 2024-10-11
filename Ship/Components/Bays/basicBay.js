// Basic cargo bay

import Bay from './bay.js';
import { ComponentType } from '../component.js';

const DESCRIPTION = "The smallest available cargo bay";

class BasicBay extends Bay {

    static type = new ComponentType("Miniskip", 1, 10, 100, 3);

    constructor(ship) {
        super(BasicBay.type, ship,  25);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default BasicBay;