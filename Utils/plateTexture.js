// A ship plate texture.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Texture from './texture.js';

const MIN_DARK = 250;
const MAX_DARK = 220;

const PLATE_COUNT = 5;
const MAX_PLATE_SIZE = 20;

class PlateTexture extends Texture{

    constructor(width, height) {
        super(width, height);

        // Paint background
        let colour = new THREE.Color("white");
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.setPixel(x, y, colour);
            }
        }

        // Paint plates.
        for (let i = 0; i < PLATE_COUNT; i++) {
            let h = Math.ceil(Math.random() * MAX_PLATE_SIZE);
            let w = Math.ceil(Math.random() * MAX_PLATE_SIZE);
            let bot = Math.floor(Math.random() * this.height);
            let left = Math.floor(Math.random() * this.width);

            let c = MAX_DARK + Math.floor(Math.random() * (MIN_DARK - MAX_DARK));
            let colour = new THREE.Color(0x010101 * c);

            for (let x = left; x < (left + w); x++) {
                for (let y = bot; y < (bot + h); y++) {
                    this.setPixel(x, y, colour);
                }
            }
        }
    }

    setPixel(x, y, colour) {
        // Handle wrap.
        if (x > this.width) {
            x -= this.width;
        }
        if (y > this.height) {
            y -= this.height;
        }

        super.setPixel(x, y, colour);
    }
}

export default PlateTexture;