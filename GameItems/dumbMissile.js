// Simple non homing missile
import * as THREE from 'three';
import Missile from './missile.js';

const COLOUR = "#ff00ff"

// Create material.
const missileMaterial = new THREE.MeshStandardMaterial(
  {
    color: COLOUR,
    emissive: COLOUR,
    roughness: 1,
    opacity: 1,
    metalness: 0,
  }
)

// Damage (hp)
const MISSILE_DAMAGE = 1;

class DumbMissile extends Missile {

  constructor(direction, owner, silent) {
    super(direction, owner, MISSILE_DAMAGE, COLOUR, missileMaterial);

    if ((undefined == silent) || (!silent)) {
      this.playSound('pew', 0.2); 
    }
  }
}

export default DumbMissile;