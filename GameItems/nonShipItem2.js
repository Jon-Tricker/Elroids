// Improved version of NonShipItem. For Items that can be deactivated when System not in use.
// Eventuially all NonShipItems should use this. But conversion reqires a bit of effort. So, for now, only the most common/memory hungry have been converted.

// // Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import NonShipItem from "./nonShipItem.js";

class NonShipItem2 extends NonShipItem {

    constructor(location, speed, size, mass, hitPoints, owner, immobile, id) {
        // The important part is to modify OurItem.constructor to NOT call setupMesh(). 
        // For activatable items this will be called each time they are activated.
        super(location, speed, size, mass, hitPoints, owner, immobile, id);

    }

    // If created in curreent system activate graphics.
    activateIfRequired() {
        let system = this.location.system;
        if (system == system.universe.system) {
            this.setActive(true);
        }
    }

    setActive(state) {
        // En/diable meshes etc.
        if (state) {
            this.setupMesh();
        } else {
            for (let object in this.children) {
                this.remove(object);

                // ... and GC
                object = null;
            }

        }
        super.setActive(state);
    }

}

export default NonShipItem2;