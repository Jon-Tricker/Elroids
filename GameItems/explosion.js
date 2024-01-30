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

class Explosion extends Item {

  maxSize;
  currentSize;

  constructor(maxSize, that) {

    // With same location and speed as exploding thing
    super(that.location.x, that.location.y, that.location.z, that.speed.x, that.speed.y, that.speed.z, that.game);

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
  }  
  
  // Don't check collisions with explosions
  getBoundingBox() {
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
      this.currentSize ++;
    }
  }
}

export default Explosion;