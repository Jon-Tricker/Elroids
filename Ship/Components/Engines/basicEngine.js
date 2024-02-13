// Basic engine

import Engine from './engine.js'

class BasicEngine extends Engine {

    constructor(ship) {
        super("Merlin", 1, 100, 2500, 0.8, ship);
    }
}

export default BasicEngine;