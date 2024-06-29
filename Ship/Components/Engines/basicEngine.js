// Basic engine

import Engine from './engine.js'

const DESCRIPTION = "A small, low thrust, engine.";

class BasicEngine extends Engine {

    constructor(ship) {
        super("Natphart1", 5, 1000, 2, ship, 4000, 0.9);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.name + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default BasicEngine;