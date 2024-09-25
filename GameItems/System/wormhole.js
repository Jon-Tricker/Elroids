// Wormhole graphic and physics

// Represented as a sphere painted on the inside. So it looks the same from any angle.
// Labales done by a sepatate 2D renderer so they also don't rotate.
// 'Twinking' of the star field is an accidental artefact ... but it looks good anyhow.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import WormholeEnd from "./wormholeEnd.js";


// Entire wormhole.
// Cannot be an Item since it is in more than on System
// For the moment connects a single system with hyperspace.
class Wormhole {
    systemEnd;
    hyperspaceEnd;

    constructor(system, systemLocation, hyperLocation) {
        let hyper = system.universe.hyperspace;
        
        this.hyperspaceEnd = new WormholeEnd(hyper, hyperLocation, system.getName(), this);
        this.systemEnd = new WormholeEnd(system, systemLocation, hyper.getName(), this, hyper.skyBox.background);

        // Add ends to systems
        system.addWormholeEnd(this.systemEnd);
        hyper.addWormholeEnd(this.hyperspaceEnd);
    } 
    
    toJSON() {
        return {
            system: this.systemEnd.system.getName(),
            systemLocation: this.systemEnd.location,
            hyperspaceLocation: this.hyperspaceEnd.location
        }
    }

    static fromJSON(json, universe) {
        let system = universe.getSystemByName(json.system);
        return (new Wormhole(system, json.systemLocation, json.hyperspaceLocation));
    }

    // Get the near end for specific system
    getNearEnd(system) {
        if (system == this.systemEnd.system) {
            return (this.systemEnd)
        }

        if (system == this.hyperspaceEnd.system) {
            return (this.hyperspaceEnd)
        }

        return (null);
    }

    // Get the far end in a specific system
    getFarEnd(system) {
        if (system == this.systemEnd.system) {
            return (this.hyperspaceEnd)
        }

        if (system == this.hyperspaceEnd.system) {
            return (this.systemEnd)
        }

        return (null);
    }
}

export default Wormhole;