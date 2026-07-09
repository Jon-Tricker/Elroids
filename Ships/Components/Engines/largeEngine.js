// Large engine
import Engine from './engine.js'
import { ComponentType } from '../component.js';

const DESCRIPTION = "High power engine.";

class LargeEngine extends Engine {

    static type = new ComponentType("Starfire", 7, 15, 4000, 2);

    constructor(set) {
        super(LargeEngine.type, set, 8000);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default LargeEngine;