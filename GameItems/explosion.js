// Explosion
// For now simple spheres.
import * as THREE from 'three';
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
    super(that.system, that.location.x, that.location.y, that.location.z, that.speed.x, that.speed.y, that.speed.z);

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

    this.playSound('explosion', this.maxSize/(MAX_SIZE * 3));
  }  
  
  // Don't check collisions with explosions
  getBoundary() {
    return (null);
  }

  animate() {
    if (this.currentSize > this.maxSize) {
      this.destruct();
    } else {
      this.scale.set(this.currentSize, this.currentSize, this.currentSize );
      this.moveItem(false);
      this.moveMesh();
      
      // Grow
      this.currentSize += 250/this.getGame().getAnimateRate();
    }
  }
}

export default Explosion;