// Simple non homing missile
import * as THREE from 'three';
import Missile from './missile.js';

const COLOUR = "#ff00ff"
const SPEED = 600;          // m/s
const DAMAGE = 1;           // hp
const RANGE = SPEED * 3;    // m

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

class DumbMissile extends Missile {

  constructor(direction, owner) {
    super(direction, owner, DAMAGE, COLOUR, SPEED, RANGE, material,'pew');
  }
}

export default DumbMissile;