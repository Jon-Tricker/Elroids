// Texture for a dynamically created star field
import * as THREE from 'three';
import Texture from '../Utils/texture.js';

// Colours with the most common first.
const starColours = [new THREE.Color(0xF0F0F0), new THREE.Color(0xF0F000), new THREE.Color(0xF08000), new THREE.Color(0xF00000), new THREE.Color(0x0000F0)];
const BACKGROUND = new THREE.Color('black');

const MAX_SIZE = 1024;

class StarFieldTexture extends Texture {

  constructor(width, height) {
    if (height > MAX_SIZE) {
      height = MAX_SIZE;
    }

    if (width > MAX_SIZE) {
      width = MAX_SIZE;
    }

    super(width, height, BACKGROUND);

    this.createData();
  }

  createData() {
    let size = this.height * this.width;

    // Add stars
    for (let i = 0; i < size / 5000; i++) {
      let x = Math.floor(Math.random() * this.width);
      let y = Math.floor(Math.random() * this.height);

      // Work out a colour
      let colour = StarFieldTexture.randomColour();

      let brightness = Math.random() * 255;
      colour.r = Math.floor(colour.r * brightness);
      colour.g = Math.floor(colour.g * brightness);
      colour.b = Math.floor(colour.b * brightness);

      this.setPixel(x, y, colour);
    }
  }

  // Generate weighted random colour.
  static randomColour() {
    let rnd = Math.random();
    let offset = Math.floor((rnd * rnd * rnd) * starColours.length);
    let colour = starColours[offset];
    return (colour);
  }

}

export default StarFieldTexture;