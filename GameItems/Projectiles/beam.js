// Beams
import * as THREE from 'three';
import NonShipItem from '../nonShipItem.js';
import Universe from '../universe.js';
import Explosion from '../explosion.js'
import Projectile from './projectile.js';

const SIZE = 1;     // m
const RANGE = SPEED * 3;    // m

class Beam extends Projectile {

  // Max range
  range;

  constructor(direction, owner, damage, colour, speed, range, material, sound) {
    super(direction, owner, damage, colour, speed, range, material, sound);
  }

  getRadarColour() {
    if (this.getGame().displays.radar.showMissiles) {
      return (this.colour);
    } else {
      // Don't plot
      return (null);
    }
  }

  getGeometry() {
    return (new THREE.CylinderGeometry(SIZE, this.getSpeed(), 8 , 8));
  }

  animate(date) {
    super.animate();
  }
}

export default Beam;