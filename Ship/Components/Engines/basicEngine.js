// Basic engine

import Engine from './engine.js'

class BasicEngine extends Engine {

    constructor(ship) {
        super("Merlin", 1, 1000, 2, 2500, 0.8, ship);
    }
}

export default BasicEngine;