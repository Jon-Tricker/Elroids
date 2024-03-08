// Minearal container

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem from './nonShipItem.js';
import Universe from '../universe.js';
import Ship from '../Ship/ship.js';
import Explosion from './explosion.js';

const MAX_SIZE = 10;

// Tine to live ms.
const TTL = 100000;   // ms

class Mineral extends NonShipItem {

  rotationRate;
  type;
  expiryTime;

  constructor(mass, locationX, locationY, locationZ, speedX, speedY, speedZ, game, type) {

    let size = Math.floor(Math.cbrt(mass));
    if (size < 1) {
      size = 1;
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }

    super(locationX, locationY, locationZ, speedX, speedY, speedZ, game, size, mass, 1);

    this.rotationRate = new THREE.Vector3(this.generateRotationRate(), this.generateRotationRate(), this.generateRotationRate());

    this.type = type;

    this.setupMesh();

    this.expiryTime = Universe.getTime() + TTL;
  }

  getRadarColour() {
    let colour = this.type.colour;
    return ("#" + colour.getHexString());
  }

  setupMesh() {
    let geometry = new THREE.CylinderGeometry(this.size/2, this.size/2, this.size);
    this.setBoundary(this.size);

    // compute vertex normals
    geometry.computeVertexNormals();

    let mesh = new THREE.Mesh(geometry, this.type.getMaterial());

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.add(mesh);
  }

  getValue() {
    return(Math.ceil(this.type.value * this.mass));
  }

  animate(date) {
    this.rotateX(this.rotationRate.x / Universe.getAnimateRate());
    this.rotateY(this.rotationRate.y / Universe.getAnimateRate());
    this.rotateZ(this.rotationRate.z / Universe.getAnimateRate());

    this.moveItem(true);
    this.moveMesh();

    if (date > this.expiryTime) {
      new Explosion(1, this);
      this.destruct();
    }
  }

  handleSpecialCollisions(that) {
      if (that instanceof Ship) {
          return(that.mineralPickup(this));
      }
      return(false);
  }
  
}

export default Mineral;