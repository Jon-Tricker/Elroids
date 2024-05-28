// Basic engine

import Engine from './engine.js'

class BasicEngine extends Engine {

    constructor(ship) {
        super("Natphart1", 5, 1000, 2, ship, 4000, 0.9);
    }
}

export default BasicEngine;