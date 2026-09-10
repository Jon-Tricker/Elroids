// Basic engine
import Engine from './engine.js';
import { ComponentType } from '../component.js';


const DESCRIPTION = "A small, low thrust, engine.";

class BasicEngine extends Engine {

    static type = new ComponentType("Natphart1", 5,  5, 1000, 2,)

    constructor(set) {
        super(set, 4000);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default BasicEngine;