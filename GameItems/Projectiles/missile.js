// Missiles

// For now simple spheres.
import * as THREE from 'three';
import NonShipItem from '../nonShipItem.js';
import Universe from '../universe.js';
import Explosion from '../explosion.js'
import Projectile from './projectile.js';

const SIZE = 1;     // m

class Missile extends Projectile {

  constructor(direction, owner, damage, colour, speed, range, material, sound) {

    super(direction, owner, damage, colour, speed, range, material, sound);

    // For missiles add in relative speed of owner
    let newSpeed = this.speed.clone();
    newSpeed.add(owner.speed);
    this.setSpeed(newSpeed);
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
    return (new THREE.SphereGeometry(SIZE, 8, 8));
  }

  animate(date) {
    super.animate();

    if (this.isDestructed()) {
      new Explosion(1, this);
    }
  }
}

export default Missile;