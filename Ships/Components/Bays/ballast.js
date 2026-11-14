// A heavy lump of something.
// Used to increase ship mass.
//
// Arguable should be a Goods type. However would then need a large cargo bay to hold it ... so make it a built in component.

import Bay from './bay.js';
import { ComponentType } from '../component.js';

const DESCRIPTION = "Mass to ballast NP ships.";

class Ballast extends Bay {

    static type = new ComponentType("Balast", 1, undefined, undefined, 0);

    myMass;

    constructor(set, mass) {
        super(set);
        this.myMass = mass;
    }

    getMass() {
        return(this.myMass);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default Ballast;