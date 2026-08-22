// Base class for Missiles and Beams.

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem from '../nonShipItem.js';
import Universe from '../universe.js';
import Explosion from '../explosion.js'

const MISSILE_SIZE = 1;     // m
const MISSILE_SPEED = 600;   // m/s
const MISSILE_MASS = 0.1;

const MISSILE_DAMAGE = 1;

// Tine to live ms.
const MISSILE_TTL = 7000;   // ms

class Projectile extends NonShipItem {

  colour;
  damage;

  // Max range
  range;      // m

  constructor(direction, owner, damage, colour, speed, range, material, sound) {

    // Set speed.
    direction = direction.normalize()
    let startSpeed = direction.multiplyScalar(speed);

    // Start at owners location.
    let startLocation = owner.getLocation().clone();

    // Create
    super(startLocation, startSpeed, MISSILE_SIZE / Universe.CBRT_THREE, MISSILE_MASS, 1, owner);

    this.range = range;

    // Tweak internals
    this.colour = colour;
    this.damage = damage;

    // Create graphic.
    this.setupMesh(material);

    this.playSound(sound, 0.2); 

    // Owner WILL move first (we a currently animating). Don't get run over.
    this.animate();
    //this.location.add(this.owner.speedFrame);
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
  
  setupMesh(material) {
      // Create a sphere.
      let geometry = this.getGeometry();
  
      // compute vertex normals
      geometry.computeVertexNormals();
  
      let mesh = new THREE.Mesh(geometry, material);
  
      mesh.castShadow = false;
      mesh.receiveShadow = false;
  
      this.add(mesh);
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