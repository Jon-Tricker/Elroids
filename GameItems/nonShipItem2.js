// Improved version of NonShipItem. For Items that can be deactivated when System not in use.
// Eventuially all NonShipItems should use this. But conversion reqires a bit of effort. So, for now, only the most common/memory hungry have been converted.

// ToDo : At present this does not work for Items that have a specific rotation plane. After de/reactication they rotate in the worng plane compared to the scene.

import NonShipItem from "./nonShipItem.js";

class NonShipItem2 extends NonShipItem {

    constructor(system, locationX, locationY, locationZ, speedX, speedY, speedZ, size, mass, hitPoints, owner, immobile) {
        // The important part is to modify OurItem.constructor to NOT call setupMesh(). 
        // For activatable items this will be called each time they are activated.
        super(system, locationX, locationY, locationZ, speedX, speedY, speedZ, size, mass, hitPoints, owner, immobile);
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