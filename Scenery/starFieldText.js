// Texture for a dynamically created star field
import * as THREE from 'three';

// Colours with the most common first.
const starColours = [new THREE.Color(0xF0F0F0), new THREE.Color(0xF0F000), new THREE.Color(0xF08000), new THREE.Color(0xF00000), new THREE.Color(0x0000F0)];
const BACKGROUND = new THREE.Color('black');

const MAX_SIZE = 1024;

class StarFieldTexture extends THREE.DataTexture {

  constructor(width, height) {
    if (height > MAX_SIZE) {
      height = MAX_SIZE;
    }

    if (width > MAX_SIZE) {
      width = MAX_SIZE;
    }

    let data = StarFieldTexture.createData(width, height);

    super(data, width, height);
    this.needsUpdate = true;
  }

  // Static because we need to call it before super();
  static createData(width, height) {

    let size = width * height;
    let data = new Uint8Array(4 * size);

    // Paint background.
    let colour = BACKGROUND;
    let r = Math.floor(colour.r * 255);
    let g = Math.floor(colour.g * 255);
    let b = Math.floor(colour.b * 255);
    for (let i = 0; i < size; i++) {
      let stride = i * 4;
      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;
      data[stride + 3] = 255;
    }

    // Add stars
    for (let i = 0; i < size/5000; i++) {
      let x =  Math.floor(Math.random() * width);
      let y =  Math.floor(Math.random() * height);
      let stride = (x * width + y) * 4;

      // Work out a colour
      colour = StarFieldTexture.randomColour();
      
      let brightness = Math.random() * 255;

      let r = Math.floor(colour.r * brightness);
      let g = Math.floor(colour.g * brightness);
      let b = Math.floor(colour.b * brightness);

      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;
    }

    return (data);
  }

  // Generate weighted random colours
  static randomColour() {
    let rnd = Math.random();
    let offset = Math.floor((rnd * rnd * rnd) * starColours.length);
    let colour = starColours[offset];
    return(colour);
  }

}

export default StarFieldTexture;