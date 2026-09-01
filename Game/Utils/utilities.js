// Utility statics

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

class Utils {
    static createRandomVector(max, integer) {
        let x = Math.random() * max * 2 - max;
        let y = Math.random() * max * 2 - max;
        let z = Math.random() * max * 2 - max;

        if ((undefined != integer) && integer) {
            x = Math.floor(x);
            y = Math.floor(y);
            z = Math.floor(z);
        }

        return (new THREE.Vector3(x, y, z));
    }
}

export default Utils;