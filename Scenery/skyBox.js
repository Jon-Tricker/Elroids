// Pretty background graphics than we don't interact with.

// Actually quite close to the ship (only just beyond the universe size). But moves with the ship. So perspective remains constant.

import * as THREE from 'three';
import Game from '../game.js';
import StarFieldTexture from '../Utils/starFieldText.js';
import JSONSet from '../Utils/jsonSet.js';

// Sizes as percentage of sky box size.
const SUN_SIZE = 5;
const MAX_MOON_SIZE = 4;

const FACIT_COUNT = 32;

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
    metalness: 1,
  }
)

class SkyBoxItem {
  skyBox;
  size;
  position;
  mesh;

  constructor(skyBox, size, position) {
    this.skyBox = skyBox;
    this.size = size;
    this.position = position;
  }

  toJSON() {
    return {
      size: this.size,
      position: this.position
    }
  }

  static fromJSON(json, skyBox) {
    return (new SkyBoxItem(skyBox, json.size, json.position));
  }

  setActive(state) {
    if (true == state) {
      this.setupMesh();

      this.mesh.position.set(this.position.x, this.position.y, this.position.z);
      this.skyBox.add(this.mesh)
    } else {
      this.skyBox.remove(this.mesh);
      // ... and GC.
      this.mesh = undefined;
    }
  }
}

class Sun extends SkyBoxItem {

  constructor(skyBox, size, position) {
    super(skyBox, size, position);
  }

  static fromJSON(json, skyBox) {
    return (new Sun(skyBox, json.size, json.position));
  }

  setupMesh() {
    let sunGeometry = new THREE.SphereGeometry(this.size, FACIT_COUNT, FACIT_COUNT);
    sunGeometry.computeVertexNormals();

    this.mesh = new THREE.Mesh(sunGeometry, sunMaterial);
  }
}

class Moon extends SkyBoxItem {
  colour;

  constructor(skyBox, size, position, colour) {
    super(skyBox, size, position);
    if (undefined === colour) {
      this.colour = this.randomColour();
    } else {
      this.colour = colour;
    }
  }

  toJSON() {
    let json = super.toJSON();
    json.colour = this.colour;
    return (json);
  }

  static fromJSON(json, skyBox) {
    return (new Moon(skyBox, json.size, json.position, json.colour));
  }

  setupMesh() {
    let moonGeometry = new THREE.SphereGeometry(this.size, FACIT_COUNT, FACIT_COUNT);
    moonGeometry.computeVertexNormals();

    let material = moonMaterial.clone();
    material.color.set(this.colour);

    this.mesh = new THREE.Mesh(moonGeometry, material);
  }

  // Generate weighted random colours
  randomColour() {
    let rnd = Math.random();
    let offset = Math.floor((rnd * rnd * rnd) * moonColours.length);
    let colour = moonColours[offset];
    return (colour);
  }
}

class SkyBox extends THREE.Group {
  system;
  size;
  background;
  moons = new JSONSet();
  suns = new JSONSet();

  constructor(size, system, populate, background, json) {
    super();

    this.size = size;
    this.system = system;

    if (undefined == background) {
      background = new THREE.Color('black');
    }
    this.background = background;

    moonMaterial.map = Game.getCraterTexture();
    moonMaterial.bumpMap = Game.getCraterTexture();

    this.populate(populate, json);
  }

  toJSON() {
    let moons = [];
    for (let moon of this.moons) {
      moons.push(moon.toJSON());
    }

    let suns = [];
    for (let sun of this.suns) {
      suns.push(sun.toJSON());
    }

    return {
      size: this.size,
      background: this.background,
      moons: moons,
      suns: suns
    }
  }

  static fromJSON(json, system) {
    return (new SkyBox(json.size, system, true, json.background, json));
  }

  // Create box in an inactive state.
  populate(populate, json) {
    if (populate) {
      if (undefined === json) {
        let moonCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i <= moonCount; i++) {

          let sz = this.getUniverse().systemSize;

          let position = this.getGame().createRandomVector(sz);

          // Stick it on a side where the sun isn't.
          switch (Math.floor(Math.random() * 5)) {
            case 0:
              position.x = sz * 2;
              break;

            case 1:
              position.x = -sz * 2;
              break;

            case 2:
              position.y = sz * 2;
              break;

            case 3:
              position.y = -sz * 2;
              break;

            case 4:
              position.x = -sz * 2;
            default:
              break;
          }

          this.moons.add(new Moon(this, (1 + Math.floor(Math.random() * MAX_MOON_SIZE)) * this.size / 100, position));
        }

        // One sun for now.
        // Same position as light.
        let sz = this.getUniverse().systemSize;
        let position = new THREE.Vector3(0, 0, sz * 2);
        this.suns.add(new Sun(this, SUN_SIZE * this.size / 100, position));
      } else {
        // Unpack json
        for (let moon of json.moons) {
          this.moons.add(Moon.fromJSON(moon, this));
        }

        for (let sun of json.suns) {
          this.suns.add(Sun.fromJSON(sun, this));
        }
      }
    }
  }

  setActive(state) {
    if (true == state) {
      this.setupMesh();
      this.getGame().getScene().add(this);
    }

    for (let sun of this.suns) {
      sun.setActive(state);
    }

    for (let moon of this.moons) {
      moon.setActive(state);
    }

    if (false == state) {
      this.getGame().getScene().remove(this);
      for (let mesh of this.children) {
        this.remove(mesh);
        // ... and GC.
        mesh = undefined;
      }
    }
  }

  getUniverse() {
    return (this.system.universe);
  }

  getGame() {
    return (this.getUniverse().game);
  }

  setupMesh() {
    let boxGeometry = new THREE.BoxGeometry(this.size, this.size, this.size);

    // compute vertex normals
    boxGeometry.computeVertexNormals();

    let boxMaterialArray = this.createDataMaterialArray(this.size, this.size);

    let boxMesh = new THREE.Mesh(boxGeometry, boxMaterialArray);
    this.add(boxMesh);
  }

  // Dynamic image creation.
  createDataMaterialArray(width, height) {
    let texture = new StarFieldTexture(width, height, 0.02, this.background).getTexture();
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