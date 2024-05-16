// Pretty background graphics than we don't interact with.

// Actually quite close to the ship (only just beyond the universe size). But moves with the ship. So perspective remains constant.

import * as THREE from 'three';
import StarFieldTexture from './starFieldText.js';
import Universe from '../universe.js';

// Sizes as percentage of sky box size.
const SUN_SIZE = 5;
const MAX_MOON_SIZE = 4;

const FACIT_COUNT= 32;

// Create sun material.
const sunMaterial = new THREE.MeshStandardMaterial(
  {
    color: "#FFFF80",
    roughness: 1,
    opacity: 1,
    emissive: 1,
    metalness: 0,
  }
)

// Colours with the most common first.
const moonColours = [new THREE.Color(0xF0F0F0), new THREE.Color(0x808080), new THREE.Color(0xF08080), new THREE.Color(0xF0F000), new THREE.Color(0x8080F0)];

// Create moon material.
const moonMaterial = new THREE.MeshStandardMaterial(
  {
    color: "#FFFFFF",
    roughness: 1,
    opacity: 1,
    emissive: 0,
    map: Universe.getCraterTexture(),
    bumpMap: Universe.getCraterTexture(),
    metalness: 1,
  }
)

class Sun extends THREE.Mesh {

  constructor(size) {
    let sunGeometry = new THREE.SphereGeometry(size, FACIT_COUNT, FACIT_COUNT);
    sunGeometry.computeVertexNormals();

    super(sunGeometry, sunMaterial);
  }
}

class Moon extends THREE.Mesh {

  constructor(size) {
    let moonGeometry = new THREE.SphereGeometry(size, FACIT_COUNT, FACIT_COUNT);
    moonGeometry.computeVertexNormals();

    let material = moonMaterial.clone();
    material.color.set(Moon.randomColour());

    super(moonGeometry, material);
  }
  
  // Generate weighted random colours
  static randomColour() {
    let rnd = Math.random();
    let offset = Math.floor((rnd * rnd * rnd) * moonColours.length);
    let colour = moonColours[offset];
    return(colour);
  }
}


class SkyBox extends THREE.Group {
  game;

  constructor(size, game, gridOn) {
    super();

    this.size = size;
    this.game = game;

    this.setupMesh(gridOn);
  }

  setupMesh(gridOn) {
    let boxGeometry = new THREE.BoxGeometry(this.size, this.size, this.size);

    // compute vertex normals
    boxGeometry.computeVertexNormals();

    if (gridOn) {
      let boxMaterialArray = this.createDataMaterialArray(this.size, this.size);

      let boxMesh = new THREE.Mesh(boxGeometry, boxMaterialArray);
      this.add(boxMesh);

      let sunMesh = new Sun(SUN_SIZE * this.size/100);
      this.add(sunMesh);

      // Same position as light.
      // sunMesh.position.set(0, Universe.UNI_SIZE * 2, Universe.UNI_SIZE * 2);
      sunMesh.position.set(0, 0, Universe.UNI_SIZE * 2);

      let moonCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i <= moonCount; i++) {
        let moonMesh = new Moon((1 + Math.floor(Math.random() * MAX_MOON_SIZE)) * this.size/100);
        this.add(moonMesh);

        let position = this.game.createRandomVector(Universe.UNI_SIZE);

        // Stick it on a side where the sun isn't.
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            position.x = Universe.UNI_SIZE * 2;
            break;

          case 1:
            position.x = -Universe.UNI_SIZE * 2;
            break;

          case 2:
            position.y = Universe.UNI_SIZE * 2;
            break;

          case 3:
            position.y = -Universe.UNI_SIZE * 2;
            break;

          case 4:
            position.x = -Universe.UNI_SIZE * 2;
          default:
            break;
        }

        moonMesh.position.set(position.x, position.y, position.z);
      }


    }
  }

  // Dynamic image creation.
  createDataMaterialArray(width, height) {
    let texture = new StarFieldTexture(width, height).getTexture();
    let textures = [];
    for (let i = 0; i < 6; i++) {
      textures.push(texture);
    }

    let materialArray = textures.map(texture => {
      return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    });

    return materialArray;
  }

  animate() {
    // Sky box does not animate
  }

}

export default SkyBox;