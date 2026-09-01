// Beam. Fast, short range, cylindrical projectiles.
// 
// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Projectile from './projectile.js';

const SIZE = 0.5;     // m

class Beam extends Projectile {

  constructor(direction, owner, damage, colour, speed, range, material, sound) {
    super(direction, owner, damage, colour, speed, range, material, sound);

    // Horrible cludge to avoid passing direction to all mesh creation. 
    let mesh = this.children[0];

    // Rotate mesh to direction of travel.
    let upAxis = new THREE.Vector3(0, 1, 0);
    let quat = new THREE.Quaternion();
    quat.setFromUnitVectors(upAxis, direction);
    mesh.applyQuaternion(quat)

    // Move mesh to centre to start.
    mesh.translateY(this.speedFrame.length() / 2);
  }

  getRadarColour() {
    // No Radar return.
    return (null);
  }

  // Beam must line up with direction of travel.
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
    return (new THREE.CylinderGeometry(SIZE, SIZE, this.speedFrame.length(), 8, 8));
  }

  animate(date) {
    super.animate();
  }
}

export default Beam;