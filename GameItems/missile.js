// Missiles
// For now simple spheres.
import * as THREE from 'three';
import NonShipItem from './nonShipItem.js';
import Universe from '../universe.js'
import Explosion from './explosion.js'

const MISSILE_SIZE = 1;     // m
const MISSILE_SPEED = 300;   // m/s
const MISSILE_MASS = 0.1;

const MISSILE_DAMAGE = 1;

// Tine to live ms.
const MISSILE_TTL = 7000;   // ms

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
    let thatBoundary = owner.getBoundary()
    //thatBoundary.translate(owner.speedFrame)
    while (this.getBoundary().intersects(thatBoundary)) {
      this.moveItem(false);
    }  
    this.moveItem(false);

    // Once launched add in relative speed of owner
    let newSpeed = this.speed.clone();
    newSpeed.add(owner.speed);
    this.setSpeed(newSpeed);
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