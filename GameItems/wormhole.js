// Wormhole graphic and physics

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem from './nonShipItem.js';
import Universe from '../universe.js';
import Ship from '../Ship/ship.js';
import StarFieldTexture from '../Utils/starFieldText.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


const RADIUS = 50;
const HALO_RADIUS = 52;
const HP = 1;
const MASS = 10000; // t
const ROTATE_RATE = 0.05;    // r/s
const COLOUR = "#D0D0FF";

let holeStarText = new StarFieldTexture(RADIUS * 10, RADIUS * 10, 0.1).getTexture();

const HOLE_MATERIAL = new THREE.MeshStandardMaterial(
    {
        // color: "#101010",
        color: "white",
        roughness: 0,
        opacity: 1,

        map: holeStarText,

        // Show back of sphere.
        side: THREE.BackSide,
        metalness: 0,
        transparent: false

    }
)

let haloStarText = new StarFieldTexture(RADIUS * 10, RADIUS * 10, 10).getTexture();

const HALO_MATERIAL = new THREE.MeshStandardMaterial(
    {
        color: COLOUR,
        roughness: 1,
        opacity: 0.5,

        map: haloStarText,

        // Show back of sphere.
        side: THREE.BackSide,
        metalness: 0,
        transparent: true
    }
)

class Wormhole extends NonShipItem {

    // List of all wormholes in current system.
    static holeList = new Set();


    galaxies = new Set;

    // Textual label
    name;
    label;

    holeMesh;
    haloMesh;

    constructor(locationX, locationY, locationZ, game, name) {
        super(locationX, locationY, locationZ, 0, 0, 0, game, RADIUS * 2, MASS, HP, null, true);
        this.name = name;
        this.setupMesh();

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    if ((Math.random() < 0.3)) {
                        let dir = new THREE.Vector3(x, y, z);
                        let galaxy = new Galaxy(dir, game);
                        this.galaxies.add(galaxy);
                        this.add(galaxy);
                    }
                }
            }
        }

        Wormhole.holeList.add(this);
    }

    destruct() {
        super.destruct();
        Wormhole.holeList.delete(this);
    }

    getClass() {
        return ("Wormhole");
    }

    static getHoleList() {
        return (Wormhole.holeList);
    }

    getRadarColour() {
        return (COLOUR);
    }

    setupMesh() {
        let holeGeom = new THREE.SphereGeometry(RADIUS, 32, 32);
        let haloGeom = new THREE.SphereGeometry(HALO_RADIUS, 32, 32);

        // compute vertex normals
        holeGeom.computeVertexNormals();
        haloGeom.computeVertexNormals();

        this.holeMesh = new THREE.Mesh(holeGeom, HOLE_MATERIAL);
        this.haloMesh = new THREE.Mesh(haloGeom, HALO_MATERIAL);

        this.addMesh(this.holeMesh);
        this.addMesh(this.haloMesh);

        // Add textual label.
        if (undefined != this.name) {
            let labelDiv = document.createElement('div');
            labelDiv.className = 'label';
            labelDiv.textContent = this.name;
            // labelDiv.style.backgroundColor = '#FFFFFF';
            labelDiv.style.color = 'red';
            // labelDiv.font-family = 'sans-serif';
            // labelDiv.padding = '2px';

            this.label = new CSS2DObject(labelDiv);
            this.label.position.set(0, 0, 0);
            this.add(this.label);
            this.label.layers.set(0);
        }
    }

    addMesh(mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.add(mesh);
    }

    doDamage(that) {
        that.takeDamage(1, this);
    }

    takeDamage(hits, that) {
        // Wormholes are indestructable
        return;
    }

    handleCollision(that) {
        if (that instanceof Ship) {
            // TODD Handle warp
            return (texture3D);
        }

        return (super.handleCollision(that));
    }

    animate() {

        // Move galaxies within
        for (let gal of this.galaxies) {
            gal.animate();
        }

        // Spin
        this.holeMesh.rotateX(ROTATE_RATE / Universe.getAnimateRate());
        this.haloMesh.rotateX(-ROTATE_RATE / Universe.getAnimateRate());

        // Kill any momentum obtained.
        this.setSpeed(Universe.originVector);

        this.moveMesh();

        this.moveItem(true);
    }
}

const galText = new THREE.TextureLoader().load("./Scenery/GalaxyTexture2.gif");

const GALAXY_MATERIAL = new THREE.MeshStandardMaterial(
    {
        color: "white",
        roughness: 0.5,
        opacity: 0.4,

        map: galText,
        bumpMap: galText,

        // Show back of sphere.
        side: THREE.DoubleSide,
        metalness: 0,
        transparent: true
    }
)

// const galaxyTexture = new THREE.TextureLoader().load("./Scenery/GalaxyTexture.gif");

class Galaxy extends THREE.Group {
    radius;
    rotateRate;

    constructor(dir, game) {
        super();

        this.setupMesh(dir, game);
    }

    setupMesh(dir, game) {
        this.radius = RADIUS * (Math.random() * 0.3 + 0.1);

        let diskGeom = new THREE.CircleGeometry(this.radius)
        diskGeom.computeVertexNormals();
        let diskMesh = new THREE.Mesh(diskGeom, GALAXY_MATERIAL);
        diskMesh.castShadow = true;
        diskMesh.receiveShadow = true;

        this.rotateRate = game.createRandomVector(Math.random(ROTATE_RATE * 2) - ROTATE_RATE);

        // Initial randomization
        this.animate();

        this.rotateRate.divideScalar(Universe.getAnimateRate() * 20);

        let pos = dir.clone();
        pos.normalize();
        pos.multiplyScalar(RADIUS - this.radius);

        diskMesh.position.set(pos.x, pos.y, pos.z);

        this.add(diskMesh);
    }

    animate() {
        this.rotateX(this.rotateRate.x);
        this.rotateY(this.rotateRate.y);
        this.rotateZ(this.rotateRate.z);
    }
}
export default Wormhole;