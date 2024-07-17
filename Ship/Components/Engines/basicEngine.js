// Basic engine

import Engine from './engine.js'

const DESCRIPTION = "A small, low thrust, engine.";

class BasicEngine extends Engine {

    constructor(set) {
        super("Natphart1", 5, 1000, 2, set, 4000);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.name + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default BasicEngine;