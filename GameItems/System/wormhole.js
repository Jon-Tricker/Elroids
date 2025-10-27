// Wormhole graphic and physics

// Represented as a sphere painted on the inside. So it looks the same from any angle.
// Labales done by a sepatate 2D renderer so they also don't rotate.
// 'Twinking' of the star field is an accidental artefact ... but it looks good anyhow.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import WormholeEnd from "./wormholeEnd.js";
import Location from "../../Game/Utils/location.js";


// Entire wormhole.
// Cannot be an Item since it is in more than on System
// For the moment connects a single system with hyperspace.
class Wormhole {
    systemEnd;
    hyperspaceEnd;

    constructor(location, hyperLocation) {
        let hyper = hyperLocation.system;
        
        this.hyperspaceEnd = new WormholeEnd(hyperLocation, location.system.getName(), this);
        this.systemEnd = new WormholeEnd(location, hyper.getName(), this, hyper.skyBox.background);

        // Add ends to systems
        location.system.addWormholeEnd(this.systemEnd);
        hyper.addWormholeEnd(this.hyperspaceEnd);
    } 
    
    toJSON() {
        return {
            system: this.systemEnd.location.system.getName(),
            systemLocation: this.systemEnd.location,
            hyperspaceLocation: this.hyperspaceEnd.location
        }
    }

    static fromJSON(json, universe) {
        let system = universe.getSystemByName(json.system);
        return (new Wormhole(Location.fromJSON(json.systemLocation, system), Location.fromJSON(json.hyperspaceLocation, universe.hyperspace)));
    }

    // Get the near end for specific system
    getNearEnd(system) {
        if (system == this.systemEnd.location.system) {
            return (this.systemEnd)
        }

        if (system == this.hyperspaceEnd.location.system) {
            return (this.hyperspaceEnd)
        }

        return (null);
    }

    // Get the far end in a specific system
    getFarEnd(system) {
        if (system == this.systemEnd.location.system) {
            return (this.hyperspaceEnd)
        }

        if (system == this.hyperspaceEnd.location.system) {
            return (this.systemEnd)
        }

        return (null);
    }
}

export default Wormhole;