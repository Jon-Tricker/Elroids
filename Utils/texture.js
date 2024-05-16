// Utility for creatings textures
// ToDo : There probably is some library to do this.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

const DEFAULT_SIZE = 50;

class Texture {

    width = DEFAULT_SIZE;
    height = DEFAULT_SIZE;

    data;

    constructor(width, height) {
        if (undefined != width) {
            this.width = width;
        }

        if (undefined != height) {
            this.height = height;
        }

        this.data = new Uint8Array(4 * this.width * this.height);
    }

    setPixel(x, y, colour) {
        let offset = (x * this.height + y) * 4;

        this.data[offset] = Math.floor(colour.r * 255);
        this.data[offset + 1] = Math.floor(colour.g * 255);
        this.data[offset + 2] = Math.floor(colour.b * 255);

        // Opacity.
        this.data[offset + 3] = 0;
    }

    getTexture() {
        let texture = new THREE.DataTexture(this.data, this.width, this.height);
        texture.needsUpdate = true;
        return (texture)
    }
}

export default Texture;