// Basic compass.
import Compass from "./compass.js"
import { ComponentType } from '../component.js';

const DESCRIPTION = "Basic compass avionics.";

class BasicCompass extends Compass {

    static type = new ComponentType("Wayfinder1", 1,  1, 5000, 1,)

    constructor(set) {
        super(BasicCompass.type, set);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default BasicCompass;