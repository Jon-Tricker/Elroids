// The wrap round box
import * as THREE from 'three';

const GRID_TEXTURE_SIZE = 100;

class WrapBox extends THREE.Group {

  constructor(size, gridOn) {
    super();

    this.size = size;
    this.setupMesh(gridOn);
  }

  createGridTexture(width, height) {
    let size = width * height;
    let data = new Uint8Array(4 * size);

    // Paint background.
    let colour = new THREE.Color('white');
    let r = Math.floor(colour.r * 255);
    let g = Math.floor(colour.g * 255);
    let b = Math.floor(colour.b * 255);

    for (let i = 0; i < size; i++) {
      let stride = i * 4;

      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;

      // Trancelucent
      data[stride + 3] = 255;
    }

    colour = new THREE.Color('black');
    r = Math.floor(colour.r * 255);
    g = Math.floor(colour.g * 255);
    b = Math.floor(colour.b * 255);

    // Paint lines
    for (let i = 0; i <= width; i++) {

      let offset = i * 4;  
      data[offset] = r;
      data[offset +1 ] = g;
      data[offset+ 2] = b;
      data[offset + 3] = 255;
    
    }  
    for (let i = 0; i <= height; i++) {

      let offset = i * 4 * width;  
      data[offset] = r;
      data[offset +1 ] = g;
      data[offset+ 2] = b;
      data[offset + 3] = 255;
    
    }

    let texture = new THREE.DataTexture(data, width, height); 
    texture.needsUpdate = true;

    // Load material texture.
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    texture.repeat.set(10, 10);

    return (texture)
  }

  setupMesh(gridOn) {
    let boxGeometry = new THREE.BoxGeometry(this.size, this.size, this.size);

    // compute vertex normals
    boxGeometry.computeVertexNormals();

    // Create material.
    let boxMaterial = new THREE.MeshStandardMaterial(
      {
        color: "#ffffff",
        roughness: 0.2,
        transparent: true,
        opacity: 0.1,
        metalness: 0,
        // map: texture,
        side: THREE.DoubleSide,
      }
    )

    if (gridOn) {
      let texture = this.createGridTexture(GRID_TEXTURE_SIZE, GRID_TEXTURE_SIZE);
      boxMaterial.map = texture;
    }

    let boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

    boxMesh.material.needsUpdate = true;

    this.add(boxMesh);
  }

  animate() {
    // Wrap box does not animate
  }

}

export default WrapBox;