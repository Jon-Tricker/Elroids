// Minearal container

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem2 from './nonShipItem2.js';
import PlayertShip from '../Ships/playerShip.js';
import Explosion from './explosion.js';

const MAX_SIZE = 10;

// Tine to live ms.
const TTL = 100000;   // ms

class Mineral extends NonShipItem2 {
  type;
  expiryTime;

  constructor(mass, location, speed, type) {

    let size = Math.floor(Math.cbrt(mass));
    if (size < 1) {
      size = 1;
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }

    super(location, speed, size, mass, 1);

    this.rotationRate = new THREE.Vector3(this.generateRotationRate(), this.generateRotationRate(), this.generateRotationRate());

    this.type = type;

    // this.setupMesh();

    this.expiryTime = this.getUniverse().getTime() + TTL;
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
    super.animate();

    if (date > this.expiryTime) {
      new Explosion(1, this);
      this.destruct();
    }
  }

  handleCollision(that) {
      if (that instanceof PlayertShip) {
          return(that.mineralPickup(this));
      }

      return(super.handleCollision(that));
  }
  
}

export default Mineral;