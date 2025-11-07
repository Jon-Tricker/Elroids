// Rocks

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem2 from './nonShipItem2.js';
import Game from '../Game/game.js';
import FacitRockGeometry from '../Game/Scenery/facitRockGeometry.js';
import { Composition } from './minerals.js';
import PlayerShip from '../Ships/playerShip.js'

// Type of rock graphics
const ROCK_STYLE_SPHERE = 0;
const ROCK_STYLE_FACIT = 1;

const ROCK_RAM_DAMAGE = 1;

// Radar colour. Same for all rocks.
const RADAR_COLOUR = "#505050";

// Create material.
const BASE_ROCK_MATERIAL = new THREE.MeshStandardMaterial(
  {
    color: RADAR_COLOUR,
    roughness: 0.5,
    opacity: 1,
    metalness: 0,
  }
)

class Rock extends NonShipItem2 {

  rockSize;
  originalHP;
  composition;
  game;

  static rockStyle = Rock.ROCK_STYLE_SPHERE;

  constructor(rockSize, location, speed, composition) {
    super(location, speed, rockSize, rockSize * rockSize * rockSize, 1 + rockSize / 10);

    BASE_ROCK_MATERIAL.map = Game.getCraterTexture();
    BASE_ROCK_MATERIAL.bumpMap = Game.getCraterTexture();

    this.rockSize = rockSize;
    this.originalHP = this.hitPoints;

    this.rotationRate = new THREE.Vector3(this.generateRotationRate(), this.generateRotationRate(), this.generateRotationRate());

    // Get mineral composition
    if (composition === undefined) {
      // Random composition.
      this.composition = new Composition(true, this.system);
    } else {
      // Same as parent.
      this.composition = composition;
    }

    let system = this.location.system;

    system.rockCount++;

    if (system == system.universe.system) {
      this.setActive(true);
    }
  }

  destruct() {
    this.location.system.rockCount--;
    super.destruct();
  }

  static setRockStyle(style) {
    if (style == "sphere") {
      Rock.rockStyle = ROCK_STYLE_SPHERE;
    } else {
      Rock.rockStyle = ROCK_STYLE_FACIT;
    }
  }

  getRadarColour() {
    return (RADAR_COLOUR);
  }

  setupMesh() {
    let rockGeometry;
    if (Rock.rockStyle == ROCK_STYLE_SPHERE) {
      rockGeometry = new THREE.SphereGeometry(this.rockSize, 64, 64);
      this.setBoundary(this.rockSize);
    } else {
      rockGeometry = new FacitRockGeometry(this.rockSize, this.composition);
      this.setBoundary(rockGeometry.getAverageSize());
    }

    // compute vertex normals
    rockGeometry.computeVertexNormals();

    // Create material for this rock.
    let rockMaterial = BASE_ROCK_MATERIAL.clone();
    rockMaterial.color = this.composition.colour;

    let rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);

    rockMesh.castShadow = true;
    rockMesh.receiveShadow = true;

    this.add(rockMesh);
  }

  // Need some special handling to cover splitting.
  takeDamage(hits, that) {

    // Dont take damage from ship rams.
    // If we do may split and fragments can also hit ship.
    if (that instanceof PlayerShip) {
      return;
    }

    // Rocks only take 1 point of damage
    if (1 < hits) {
      hits = 1;
    }

    let destroyed = super.takeDamage(hits, that);

    // If still there split it.
    if (!destroyed && (this.hitPoints > 0)) {
      this.split();
    }
  }

  getValue() {
    return(this.composition.getValue() * this.getMass())
  }

  split() {
    let newSize = Math.floor(this.rockSize / 2);

    let loc = this.getLocation().clone();
    let spd = this.speed.clone();

    this.destruct();


    if (2 < newSize) {

      // Create a pair of compositions.
      let newComp = this.composition.split();

      // Sort out how to split speed.
      let ratio = new THREE.Vector3(1, 1, 1);
      let ratio2 = new THREE.Vector3(1, 1, 1);
      if ((0 != this.composition.getValue()) && (0 != newComp.getValue())) {
        ratio = new THREE.Vector3(Math.random(), Math.random(), Math.random());
        ratio2 = new THREE.Vector3(1, 1, 1).sub(ratio);
      }

      if (0 < this.composition.getValue()) {
        let rock = new Rock(newSize, loc, new THREE.Vector3(spd.x * ratio.x, spd.y * ratio.y, spd.z * ratio.z), this.composition);
        rock.setActive(true);

        // Possible recurse
        if (Math.random() < 0.1) {
          rock.split();
        }
      }

      if (0 < newComp.getValue()) {
        let rock = new Rock(newSize, loc, new THREE.Vector3(spd.x * ratio2.x, spd.y * ratio2.y, spd.z * ratio2.z), newComp);
        rock.setActive(true);

        // Possible recurse
        if (Math.random() < 0.1) {
          rock.split();
        }
      }
    } else {
      this.composition.mineralize(loc, spd, this.mass / 2, this.system);
    }
  }

  doDamage(that) {
    // Don't damage other rocks.
    if (!(that instanceof Rock)) {
      that.takeDamage(ROCK_RAM_DAMAGE, this);
    }
  }

}

export default Rock;