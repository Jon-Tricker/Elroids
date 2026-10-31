// A special 'star system' representing hyperspace.
//
// Distances are in light years. 
// Univeral location is not used.
import * as THREE from 'three';
import Game from '../../Game/game.js';
import { System, SystemSpec } from './system.js'
import SkyBox from '../../Game/Scenery/skyBox.js';

class Hyperspace extends System {
    // Distance units.
    units = "ly";

    constructor(systemSize) {
        super(undefined, new SystemSpec(undefined, "Hyperspace", 0, 0, 0, "The void between the stars."), systemSize, new THREE.Vector3(), new THREE.Color(0x000020));
    }

    createSkyBox(background, json) {
        // Create unpopulated. Json not used.
        let skyBoxSize = this.systemSize * 4;
        this.skyBox = new SkyBox(undefined, this, skyBoxSize, false, background);
    }
}

export default Hyperspace;