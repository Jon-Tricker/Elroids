// A special 'star system' representing hyperspace.
//
// Distances are in light years. 
// Univeral location is not used.
import * as THREE from 'three';
import { System, SystemSpec } from './system.js'
import SkyBox from '../../Game/Scenery/skyBox.js';

class Hyperspace extends System {
    // Distance units.
    units = "ly";

    constructor(universe, systemSize) {
        super(universe, new SystemSpec("Hyperspace", 0, 0), systemSize, universe.game.originVector, new THREE.Color(0x000020), undefined);
    }

    createSkyBox(background, json) {
        // Create unpopulated. Json not used.
        let skyBoxSize = this.universe.systemSize * 4;
        this.skyBox = new SkyBox(skyBoxSize, this, false, background);
    }
}

export default Hyperspace;