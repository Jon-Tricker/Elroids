// Rocks

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem from './nonShipItem.js';
import Universe from '../universe.js'
import FacitRockGeometry from '../facitRockGeometry.js'
import { MineralType, MineralComponent, Composition } from './minerals.js';

const SPLIT_VIOLENCE = 2;

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
    map: Universe.getCraterTexture(),
    // roughnessMap: texture,
    bumpMap: Universe.getCraterTexture(),
    metalness: 0,
  }
)

class Rock extends NonShipItem {

  rockSize;
  originalHP;
  rotationRate;
  composition;
  game;

  static rockStyle = Rock.ROCK_STYLE_SPHERE;

  constructor(rockSize, locationX, locationY, locationZ, speedX, speedY, speedZ, game, composition) {
    super(locationX, locationY, locationZ, speedX, speedY, speedZ, game, rockSize, rockSize * rockSize * rockSize, 1 + rockSize / 10);

    this.rockSize = rockSize;
    this.originalHP = this.hitPoints;
    this.game = game;

    this.rotationRate = new THREE.Vector3(this.generateRotationRate(), this.generateRotationRate(), this.generateRotationRate());

    // Get mineral composition
    if (composition === undefined) {
      // Random composition.
      this.composition = new Composition(true);
    } else {
      // Same a s parent.
      this.composition = composition;
    }

    this.setupMesh();

    game.rockCount++;
  }

  destruct() {
    this.game.rockCount--;
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

    // Rocks only take 1 point of damage
    if (1 > hits) {
      hits = 1;
    }

    let destroyed = super.takeDamage(hits, that);

    // If still there split it.
    if (!destroyed && (this.hitPoints > 0)) {
      this.split();
    }
  }

  split() {
    let newSize = Math.floor(this.rockSize / 2);

    if (1 < newSize) {
      // Create a pair of repacements.
      let speedRatio = Math.random();

      // Some ramdom violence based on size of impact.
      let bang = new THREE.Vector3((Math.random() * SPLIT_VIOLENCE * 2) - SPLIT_VIOLENCE, (Math.random() * SPLIT_VIOLENCE * 2) - SPLIT_VIOLENCE, Math.random() * (SPLIT_VIOLENCE * 2) - SPLIT_VIOLENCE);

      // Create a pair of compositions.
      let newComp = this.composition.split();

      new Rock(newSize, this.location.x, this.location.y, this.location.z, this.speed.x * speedRatio + bang.x, this.speed.y * speedRatio + bang.y, this.speed.z * speedRatio + bang.z, this.game, this.composition);

      speedRatio = 1 - speedRatio;
      bang.multiplyScalar(-1);
      new Rock(newSize, this.location.x, this.location.y, this.location.z, this.speed.x * speedRatio + bang.x, this.speed.y * speedRatio + bang.y, this.speed.z * speedRatio + bang.z, this.game, newComp);
    } else {
      this.composition.mineralize(this.location, this.speed, this.mass, this.game);
    }

    this.destruct();

  }

  doDamage(that) {
    // Don't damage other rocks.
    if (!(that instanceof Rock)) {
      that.takeDamage(ROCK_RAM_DAMAGE, this);
    }
  }

  animate() {
    this.rotateX(this.rotationRate.x / Universe.getAnimateRate());
    this.rotateY(this.rotationRate.y / Universe.getAnimateRate());
    this.rotateZ(this.rotationRate.z / Universe.getAnimateRate());

    this.moveItem(true);
    this.moveMesh();
  }
}

export default Rock;