// Medium engine
import Engine from './engine.js'
import { ComponentType } from '../component.js';

const DESCRIPTION = "Medium power engine.";

class MediumEngine extends Engine {

    static type = new ComponentType("Pootle7", 2, 10, 2000, 2);

    constructor(set) {
        super(MediumEngine.type, set, 6000);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default MediumEngine;