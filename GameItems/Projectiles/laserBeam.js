// Simple energy beam
import * as THREE from 'three';
import Beam from './beam.js';

const COLOUR = "#ff0000"
const SPEED = 3000;          // m/s
const DAMAGE = 1;           // hp
const RANGE =  SPEED / 2;    // m

// Create material.
const material = new THREE.MeshStandardMaterial(
  {
    color: COLOUR,
    emissive: COLOUR,
    roughness: 1,
    opacity: 1,
    metalness: 0,
  }
)

class LaserBeam extends Beam {

  constructor(direction, owner) {
    super(direction, owner, DAMAGE, COLOUR, SPEED, RANGE, material, 'zap');
  }
}

export default LaserBeam;