// A serializable Quaternion
//
// Base Quaternion class does not serialize properly. Also too many deimal places ... so trim it.
// 
// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';

class JSONQuaternion extends THREE.Quaternion {

    constructor(json, x, y, z, w) {
        if (undefined != json) {
            x = json.x;
            y - json.y;
            z = json.z;
            w = json.w;
        }
        super(x, y, z, w);
        this.normalize();
    }

    toJSON() {
        return {
            x: Number(this.x.toFixed(4)),
            y: Number(this.y.toFixed(4)),
            z: Number(this.z.toFixed(4)),
            w: Number(this.w.toFixed(4))
        }
    }
}

export default JSONQuaternion;