// Basic engine

import Engine from './engine.js'

class BasicEngine extends Engine {

    constructor(ship) {
        super("Merlin", 5, 1000, 2, 2500, 0.9, ship);
    }
}

export default BasicEngine;