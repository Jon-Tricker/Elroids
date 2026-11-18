// A serializable Quaternion
//
// Base Quaternion class does not serialize properly. Also too many deimal places ... so trim it.
// 
// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';

// Precision for save.
const DIGITS = 6;

class JSONQuaternion extends THREE.Quaternion {

    constructor(json, x, y, z, w) {
        if (undefined != json) {
            x = json.x;
            y = json.y;
            z = json.z;
            w = json.w;
        }
        super(x, y, z, w);
        this.normalize();
    }

    toJSON() {
        return {
            x: Number(this.x.toFixed(DIGITS)),
            y: Number(this.y.toFixed(DIGITS)),
            z: Number(this.z.toFixed(DIGITS)),
            w: Number(this.w.toFixed(DIGITS))
        }
    }
}

export default JSONQuaternion;