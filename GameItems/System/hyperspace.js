// A special 'star system' representing hyperspace.
//
// Distances are in light years. 
// Univeral location is not used.
import * as THREE from 'three';
import { System, SystemSpec } from './system.js'
import SkyBox from '../../Scenery/skyBox.js';

class Hyperspace extends System {
    // Distance units.
    units = "ly";

    constructor(universe, systemSize) {
        super(universe, new SystemSpec("Hyperspace", 0, 0), systemSize, universe.game.originVector, new THREE.Color(0x000020));
    }

    createSkyBox(size, background) {
        // Create unpopulated.
        this.skyBox = new SkyBox(size, this, false, background);
    }
}

export default Hyperspace;