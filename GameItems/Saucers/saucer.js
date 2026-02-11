// Saaucer graphic and physics

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem from '../nonShipItem.js';
import Mineral from '../mineral.js';
import { MineralTypes } from '../minerals.js';
import Explosion from '../explosion.js';
import DumbMissile from '../dumbMissile.js';
import Universe from '../universe.js';

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

    // Time to self destruct.
    // 0 if never.
    destructTime = 0;

    constructor(size, location, mass, colour, owner) {
        super(location, Universe.originVector, size, mass, SAUCER_HP, owner);
        this.colour = colour;

        this.setupMesh();
        this.rotateRate = Math.random() * MAX_ROTATE_RATE * 2 - MAX_ROTATE_RATE;

        let ttl = this.getTtl();
        if ((0 != ttl) && (!this.getGame().isSafe())) {
            this.destructTime = this.getUniverse().getTime() + Math.floor(ttl / 2 + Math.random() * ttl / 2);
        }

        this.location.system.saucerCount++;
    }

    // Return time to live.
    // 0 if forever.
    getTtl() {
        return (0);
    }

    destruct() {
        this.location.system.saucerCount--;
        super.destruct();
    }

    getDefaultMaterial() {
        return (DEFAULT_SAUCER_MATERIAL);
    }

    getRadarColour() {
        return ("#00D0D0");
    }

    getMaxSpeed() {
        return (0);
    }

    setupMesh() {
        let material = this.getDefaultMaterial().clone();
        material.color.set(this.colour);

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

        if ((that.owner == this.getShip()) || (that == this.getShip())) {
            if (destroyed) {
                // For now only make loot if destroyed by ship.
                this.makeLoot();
            }

            // Now it's war!
            this.getGame().setSafe(false);
        }
    }

    makeLoot() {
        let value = Math.ceil(0.5 + this.getScore() * Math.random() * 1.5);
        let thisLoc = this.getLocation();
        switch (Math.floor(Math.random() * 4)) {
            case 0:
                // Make mineral
                let type = MineralTypes[1 + Math.floor(Math.random() * (MineralTypes.length - 1))];
                let mass = Math.ceil(value / type.value);
                let mineral = new Mineral(mass, thisLoc, this.speed, type);
                break;

            case 1:
                // Make goods.
                let good = new (this.getGame().goodsList.getRandomElement()).constructor();
                good.number = Math.ceil(value / good.type.cost);
                let crate = good.makeCrate(thisLoc, this.speed);
                break;

            case 2:
                // Todo make component.
                break;

            default:
                // Don't make anything.
                break;
        }
    }

    doDamage(that) {
        that.takeDamage(1, this);
    }

    // Override in sub classes.
    getScore() {
        0;
    }

    animate(date) {
        // Spin
        this.rotation.y += this.rotateRate / this.getGame().getAnimateRate();

        // Lean towards direction of travel. Dont wobble.
        // TODO : Not really right but looks pretty ... feel free to improve.
        if (0 != this.getMaxSpeed()) {
            if (0.5 < (this.getSpeed() / this.getMaxSpeed())) {
                this.rotation.x = (Math.PI / 2) - (Math.PI * ((this.speed.x / this.getMaxSpeed()) / 8));
                this.rotation.z = (Math.PI * ((this.speed.z / this.getMaxSpeed()) / 8));
            }
        }

        this.moveMesh();

        this.navigate();
        this.shoot();

        this.moveItem(true);

        if ((0 != this.destructTime) && (date > this.destructTime)) {
            this.explode();
        }
    }

    // Self destruct.
    explode() {
        // Make fragments
        let count = Math.ceil(Math.random() * 100);
        for (let i = 0; i < count; i++) {
            let direction = this.getGame().createRandomVector(2);
            new DumbMissile(direction, this, true);
        }

        // Blow up.
        new Explosion(this.size, this);
        this.destruct();
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