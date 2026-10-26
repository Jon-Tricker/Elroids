// Wormhole graphic and physics

// Represented as a sphere painted on the inside. So it looks the same from any angle.
// Labales done by a sepatate 2D renderer so they also don't rotate.
// 'Twinking' of the star field is an accidental artefact ... but it looks good anyhow.

// Copyright (C) Jon Tricker 2023-2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import WormholeEnd from "./wormholeEnd.js";
import BugError from "../../Game/bugError.js";

// Entire wormhole.
// Cannot be an Item since it is in more than on System
// For the moment connects a single system with hyperspace.
class Wormhole {
    systemEnd;
    hyperspaceEnd;

    constructor(json, systemLocation, hyperLocation) {
        if (undefined != json) {
            this.hyperspaceEnd = new WormholeEnd(json.hyperspaceEnd, undefined, undefined, this);
            this.systemEnd = new WormholeEnd(json.systemEnd, undefined, undefined, this);
        } else {
            this.hyperspaceEnd = new WormholeEnd(undefined, hyperLocation, systemLocation.system.getName(), this);
            this.systemEnd = new WormholeEnd(undefined, systemLocation, undefined, this, hyperLocation.system.skyBox.background);
        }
    }

    toJSON() {
        return {
            systemEnd: this.systemEnd.toJSON(),
            hyperspaceEnd: this.hyperspaceEnd.toJSON()
        }
    }

    // Get the near end for specific system
    getNearEnd(system) {
        if (system == this.systemEnd.location.system) {
            return (this.systemEnd)
        }

        if (system == this.hyperspaceEnd.location.system) {
            return (this.hyperspaceEnd)
        }

        throw new BugError("Wormhole does not connect to system.");
    }

    // Get the far end in a specific system
    getFarEnd(system) {
        if (system == this.systemEnd.location.system) {
            return (this.hyperspaceEnd)
        }

        if (system == this.hyperspaceEnd.location.system) {
            return (this.systemEnd)
        }

        throw new BugError("Wormhole does not connect to system.");
    }
}

export default Wormhole;