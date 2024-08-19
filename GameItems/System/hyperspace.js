// A special 'star system' representing hyperspace.
//
// Distances are in light years. 
// Univeral location is not used.
import System from './system.js'

class Hyperspace extends System{
    // Distance units.
    units = "ly";

    constructor(universe, systemSize) { 
        super(universe, "Hyperspace", systemSize, universe.game.originVector);
    }
}

export default Hyperspace;