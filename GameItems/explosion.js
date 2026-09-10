// Explosion
// For now simple spheres.
 
// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';
import Game from '../Game/game.js';
import Item from './item.js';

// Create material.
const explosionMaterial = new THREE.MeshStandardMaterial(
  {
    color: "#ffffff",
    emissive: "#ffffff",
    roughness: 0,
    opacity: 0.5,
    metalness: 1,
  }
)

const MAX_SIZE = 10;

class Explosion extends Item {

  maxSize;
  currentSize;

  constructor(maxSize, that) {
    // With same location and speed as exploding thing
    let thatLoc = that.getLocation();
    super(thatLoc, that.speed);

    if (MAX_SIZE < this.maxSize) {
      this.maxSize = MAX_SIZE;
    }

    this.maxSize = maxSize;
    this.currentSize = 1;

    this.setupMesh();
  }

  setupMesh() {
    // Create a sphere.
    // TODO make more interesting.
    let explosionGeometry = new THREE.SphereGeometry(this.currentSize, 8, 8);

    // compute vertex normals
    explosionGeometry.computeVertexNormals();

    let explosionMesh = new THREE.Mesh(explosionGeometry, explosionMaterial);

    this.add(explosionMesh);

    this.playSound('explosion', this.maxSize / (MAX_SIZE * 3));
  }

  setLabel(label) {
    // Don't label explosions.
  }

  animate() {
    if (this.currentSize > this.maxSize) {
      this.destruct();
    } else {
      this.scale.set(this.currentSize, this.currentSize, this.currentSize);

      // Don't check collisions with explosions
      this.moveItem(false);
      this.moveMesh();

      // Grow
      this.currentSize += 250 / Game.getGame().getAnimateRate();
    }
  }
}

export default Explosion;