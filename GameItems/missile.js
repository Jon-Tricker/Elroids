// Missiles
// For now simple spheres.
import * as THREE from 'three';
import NonShipItem from './nonShipItem.js';
import Universe from '../universe.js'
import Explosion from './explosion.js'

const MISSILE_SIZE = 0.1;
const MISSILE_SPEED = 3;
const MISSILE_MASS = 0.001;

const MISSILE_DAMAGE = 1;

// Tine to live ms.
const MISSILE_TTL = 7000;

class Missile extends NonShipItem {

  expiryTime;
  colour;
  damage;

  constructor(direction, owner, damage, colour, material) {

    // Normalise direction.
    direction = direction.normalize()

    let startSpeed = new THREE.Vector3();
    startSpeed = direction.multiplyScalar(MISSILE_SPEED);

    // Ship will move first. So move out starting location in anticipation.
    let startLocation = owner.location.clone();

    // Launch at just missile speed.
    super(startLocation.x, startLocation.y, startLocation.z, startSpeed.x, startSpeed.y, startSpeed.z , owner.game, MISSILE_SIZE / Universe.CBRT_THREE, MISSILE_MASS, 1, owner);

    this.colour = colour;
    this.damage = damage;
    this.expiryTime = Universe.getTime() + MISSILE_TTL;

    this.setupMesh(material);

    // Move it clear of parents new position. 
    let thatBox = owner.getBoundingBox()
    thatBox.translate(owner.speed)
    while (this.getBoundingBox().intersectsBox(thatBox)) {
      this.location.add(this.speed);
    } 

    // Once launched add in relative speed of owner
    this.speed.add(owner.speed);
  }

  getRadarColour() {
    return (this.colour);
  }

  setupMesh(material) {
    // Create a sphere.
    // TODO make more interesting.
    let missileGeometry = new THREE.SphereGeometry(MISSILE_SIZE, 8, 8);

    // compute vertex normals
    missileGeometry.computeVertexNormals();
    // Do this once
    missileGeometry.computeBoundingBox();

    let missileMesh = new THREE.Mesh(missileGeometry, material);

    missileMesh.castShadow = false;
    missileMesh.receiveShadow = false;

    this.add(missileMesh);
  }

  animate(date) {
    this.moveItem(true);
    this.moveMesh();
    if (date > this.expiryTime) {
      new Explosion(1, this);
      this.destruct();
    }
  }

  collideWith(that) {
    // Don't shoot self
    if (that != this.owner) {
      super.collideWith(that);

      // We are done
      this.destruct();
    }
  }

  doDamage(that) {
    // Don't hit more than one thing.
    that.takeDamage(this.damage, this);
  }
}

export default Missile;