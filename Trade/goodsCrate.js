// Goods container

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem2 from '../GameItems/nonShipItem2.js';
import PlayerShip from '../Ships/playerShip.js';
import Explosion from '../GameItems/explosion.js';

const SIZE = 5;

// Tine to live ms.
const TTL = 100000;   // ms 

const COLOUR = "burlywood";

const MATERIAL = new THREE.MeshStandardMaterial(
  {
    color: COLOUR,
    roughness: 0,
    metalness: 0.8,
  })

class GoodsCrate extends NonShipItem2 {
  contents;
  expiryTime;

  constructor(system, locationX, locationY, locationZ, speedX, speedY, speedZ, contents) {

    let mass = contents.getMass();

    super(system, locationX, locationY, locationZ, speedX, speedY, speedZ, SIZE, mass, 1);

    this.contents = contents;

    this.rotationRate = new THREE.Vector3(this.generateRotationRate(), this.generateRotationRate(), this.generateRotationRate());

    this.expiryTime = this.getUniverse().getTime() + TTL;
  }

  getRadarColour() {
    return (COLOUR);
  }

  setupMesh() {
    let geometry = new THREE.BoxGeometry(this.size/2, this.size/2, this.size);
    this.setBoundary(this.size);

    // compute vertex normals
    geometry.computeVertexNormals();

    let mesh = new THREE.Mesh(geometry, MATERIAL);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.add(mesh);
  }

  animate(date) {
    super.animate();

    if (date > this.expiryTime) {
      new Explosion(1, this);
      this.destruct();
    }
  }

  handleCollision(that) {
      if (that instanceof PlayerShip) {
          return(that.cratePickup(this));
      }

      return(super.handleCollision(that));
  }
  
}

export default GoodsCrate;