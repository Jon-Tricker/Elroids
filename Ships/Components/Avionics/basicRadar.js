// Basic radar.
import Radar from './radar.js';
import { ComponentType } from '../component.js';


const DESCRIPTION = "Basic radar avionics.";

class BasicRadar extends Radar {

    static type = new ComponentType("Rpad1", 1,  1, 5000, 1,)

    constructor(set) {
        super(BasicRadar.type, set);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default BasicRadar;