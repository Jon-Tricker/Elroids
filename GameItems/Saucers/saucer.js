// Saaucer graphic and physics

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem from '../nonShipItem.js';
import Universe from '../../universe.js';

const MAX_ROTATE_RATE = 2.5;    // r/s
const SAUCER_HP = 1;

// Create saucer material.
const DEFAULT_COLOUR = "#D0FFD0";
const DEFAULT_SAUCER_MATERIAL = new THREE.MeshStandardMaterial(
    {
        color: DEFAULT_COLOUR,
        roughness: 0.5,
        opacity: 1,
        // emmisive: COLOUR,
        // map: texture,
        // roughnessMap: texture,
        // bumpMap: texture,
        metalness: 0.95,
    }
)

class Saucer extends NonShipItem {

    rotateRate;
    colour;

    // Safe mode ... leathality reduced.
    safe;

    constructor(size, locationX, locationY, locationZ, game, mass, colour, owner, safe) {
        super(locationX, locationY, locationZ, 0, 0, 0, game, size, mass, SAUCER_HP, owner);
        this.colour = colour;

        let saucerMaterial = this.getDefaultMaterial().clone();
        saucerMaterial.color.set(colour);

        this.setupMesh(saucerMaterial);
        this.rotateRate = Math.random() * MAX_ROTATE_RATE * 2 - MAX_ROTATE_RATE;

        if (safe === undefined) {
            this.safe = false;
        } else {
            this.safe = safe;
        }

        this.game.saucerCount++;
    }

    destruct() {
        this.game.saucerCount--;
        super.destruct();
    }

    getClass() {
        return ("Saucer");
    }

    getDefaultMaterial() {
        return (DEFAULT_SAUCER_MATERIAL);
    }

    getRadarColour() {
        return (this.colour);
    }

    getMaxSpeed() {
        return (0);
    }

    setupMesh(material) {
        let sphereGeometry = new THREE.SphereGeometry(this.size / 2, 64, 64);

        // compute vertex normals
        sphereGeometry.computeVertexNormals();

        let sphereMesh = new THREE.Mesh(sphereGeometry, material);

        sphereMesh.castShadow = true;
        sphereMesh.receiveShadow = true;

        let lowerGeometry = new THREE.ConeGeometry(this.size, this.size / 2, 10);
        lowerGeometry.computeVertexNormals();

        let lowerMesh = new THREE.Mesh(lowerGeometry, material);

        //lowerMesh.rotateX(Math.PI);
        lowerMesh.position.set(0, this.size / 4, 0);

        lowerMesh.castShadow = true;
        lowerMesh.receiveShadow = true;

        let upperGeometry = new THREE.ConeGeometry(this.size, this.size / 2, 10);
        upperGeometry.computeVertexNormals();

        let upperMesh = new THREE.Mesh(upperGeometry, material);

        upperMesh.rotateX(Math.PI);
        upperMesh.position.set(0, -this.size / 4, 0);

        upperMesh.castShadow = true;
        upperMesh.receiveShadow = true;

        this.add(sphereMesh);
        this.add(lowerMesh);
        this.add(upperMesh);

        this.rotateX(-Math.PI / 2);
    }

    takeDamage(hits, that) {
        let destroyed = super.takeDamage(hits, that);

        if (destroyed) {
            if ((that.owner == this.game.ship) || (that == this.game.ship)) {
                // Score it
                this.game.ship.addCredits(this.getScore(), that);
                this.game.displays.addMessage("Bounty " + this.getScore() + "  (Cr)");
            }
        }
    }

    doDamage(that) {
        that.takeDamage(1, this);
    }

    // Override in sub classes.
    getScore() {
        0;
    }

    animate() {
        // Spin
        this.rotation.y += this.rotateRate / Universe.getAnimateRate();

        // Lean towards direction of travel. Dont wobble.
        // TODO : Not really right but looks pretty ... feel free to improve.
        if (0 != this.getMaxSpeed()) {
            if (0.5 < (this.speed.length() / this.getMaxSpeed())) {
                this.rotation.x = (Math.PI / 2) - (Math.PI * ((this.speed.x / this.getMaxSpeed()) / 8));
                this.rotation.z = (Math.PI * ((this.speed.z / this.getMaxSpeed()) / 8));
            }
        }

        this.moveMesh();

        this.navigate();
        this.shoot();

        this.moveItem(true);
    }

    // Do navigation logic
    navigate() {
        // By defalt no navigation
    }

    // Do shooting logic
    shoot() {
        // By defalt no shooting
    }
}

export default Saucer;