// Some sort of thing used to represent the space occupied by an Item. 

// For now just a sphere but may eventually be more complex then the bounding box/sphere supplied by threeJS.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Universe from '../universe.js'

class ItemBoundary extends THREE.Sphere{

    size;
    location;

    constructor(location, size) {
        super(location, size);
        this.location = location;
        this.size = size;
    }

    moveTo(location) {
        super.set(location, this.size);
    }

    /*
    intersectsBox(box) {
        super.intersectsBox(box);
    }
    */

    intersects(that) {
        return (this.intersectsSphere(that));
    }
}

export default ItemBoundary;