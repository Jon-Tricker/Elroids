// Base class for Missiles and Beams.

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem2 from '../nonShipItem2.js';
import Universe from '../universe.js';

const MISSILE_SIZE = 1;     // m
const MISSILE_MASS = 0.1;

class Projectile extends NonShipItem2 {

  colour;
  damage;
  material;

  // Max range
  range;      // m

  constructor(direction, owner, damage, colour, speed, range, material, sound) {

    // Set speed.
    direction = direction.normalize()

    // Start at owners gun location.
    let startLocation = owner.getGunPoint();

    let startSpeed = direction.clone();
    startSpeed.multiplyScalar(speed);

    // Add in relative speed of owner
    // I belive relativity says we also do this for energy beams.
    startSpeed.add(owner.speed);

    // Create. Create at our speed so graphics do not include owners seed.
    super(startLocation, startSpeed, MISSILE_SIZE / Universe.CBRT_THREE, MISSILE_MASS, 1, owner, false, undefined, false);

    this.range = range;
    this.colour = colour;
    this.damage = damage;
    this.material = material;

    this.playSound(sound, 0.2);

    this.activateIfRequired();
  }

  animate() {
    super.animate()

    this.range -= this.speedFrame.length();
    if (0 > this.range) {
      this.destruct();
    }
  }

  getRadarColour() {
    if (this.getGame().displays.radar.showMissiles) {
      return (this.colour);
    } else {
      // Don't plot
      return (null);
    }
  }

  // Default spherical geometry.
  setupMesh() {
    // Create the geometry.
    let geometry = this.getGeometry();

    // compute vertex normals
    geometry.computeVertexNormals();

    let mesh = new THREE.Mesh(geometry, this.material);

    mesh.castShadow = false;
    mesh.receiveShadow = false;

    this.add(mesh);
  }

  getGeometry() {
    return (new THREE.SphereGeometry(MISSILE_SIZE, 8, 8));
  }

  collideWith(that) {
    super.collideWith(that);
    this.destruct();
  }

  doDamage(that) {
    // Don't hit more than one thing.
    that.takeDamage(this.damage, this);
  }
}

export default Projectile;