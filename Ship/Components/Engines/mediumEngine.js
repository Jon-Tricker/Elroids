// Medium engine

import Engine from './engine.js'

const DESCRIPTION = "Medium power engine.";

class MediumEngine extends Engine {

    constructor(set) {
        super("Pootle7", 10, 2000, 2, set, 6000);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.name + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default MediumEngine;