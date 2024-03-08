// Some sort of thing used to represent the space occupied by an Item. 

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

class ItemBoundary extends THREE.Sphere{


    constructor(location, size) {
        super(location, size);
    }

    moveTo(location) {
        super.set(location, this.radius);
    }

    getSize() {
        return(this.radius);
    }

    intersects(that) {
        return (this.intersectsSphere(that));
    }
}

export default ItemBoundary;