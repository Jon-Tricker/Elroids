// Missiles

// For now simple spheres.
import Game from '../../Game/game.js';
import Explosion from '../explosion.js'
import Projectile from './projectile.js';

const SIZE = 1;     // m

class Missile extends Projectile {

  constructor(direction, owner, damage, colour, speed, range, material, sound) {
    super(direction, owner, damage, colour, speed, range, material, sound);
  }

  getRadarColour() {
    if (Game.getGame().displays.radar.showMissiles) {
      return (this.colour);
    } else {
      // Don't plot
      return (null);
    }
  }

  animate(date) {
    super.animate();

    if (this.isDestructed()) {
      new Explosion(1, this);
    }
  }
}

export default Missile;