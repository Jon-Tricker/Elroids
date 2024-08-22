// One end of a wormhole

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem from '../nonShipItem.js';
import Universe from '../../universe.js';
import Ship from '../../Ship/ship.js';
import StarFieldTexture from '../../Utils/starFieldText.js';

const RADIUS = 50;
const HALO_RADIUS = 52;
const HP = 1;
const MASS = 10000; // t
const ROTATE_RATE = 0.05;    // r/s
const COLOUR = "#D0D0FF";

let haloStarText = new StarFieldTexture(RADIUS * 10, RADIUS * 10, 100).getTexture();

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

// One end of a wormhole. Including the graphics.
// Since it exists in one System this can be an Item.
class WormholeEnd extends NonShipItem {
    galaxies = new Set;

    // Parent
    wormhole;

    letholeMesh;
    haloMesh;

    backgroundColour;

    constructor(system, location, name, wormhole, backgroundColour) {
        super(system, location.x, location.y, location.z, 0, 0, 0, RADIUS * 2, MASS, HP, null, true);
        this.wormhole = wormhole;

        if (undefined == backgroundColour) {
            backgroundColour = new THREE.Color("black");
        }
        this.backgroundColour = backgroundColour;
        
        this.setupMesh();

        this.addLabel(name);

        // Add galaxy disks.
        /*
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    if ((Math.random() < 0.3)) {
                        let dir = new THREE.Vector3(x, y, z);
                        let galaxy = new Galaxy(dir, this.getGame());
                        this.galaxies.add(galaxy);
                        this.add(galaxy);
                    }
                }
            }
        }
        */
    }

    destruct() {
        super.destruct();
    }

    getClass() {
        return ("WormholeEnd");
    }

    getWormhole() {
        return (this.wormhole);
    }

    // Traverse the wormhole.
    // Return true if sucessful.
    // For now only Ships go through wormholes.
    enter(that) {
        // Get far end
        let farEnd = this.wormhole.getFarEnd(this.system);

        // Do 'warp' animation.
        this.getGame().displays.addMessage("Entering " + farEnd.system.name);

        // Remove that from current system.
        this.system.removeItem(that);


        // Add that to far system.
        farEnd.system.addItem(that);

        // Move it outside far wormhole end.
        let loc = farEnd.location.clone();

        // Move it beyond middle.
        loc.add(that.speed);
        that.location = loc;

        // Move it outside
        that.separateFrom(farEnd);

        if (that instanceof Ship) {
            // Deactivate current system.
            this.system.setActive(false);

            // Activate far system.
            farEnd.system.setActive(true);

            // Switch universe to far system
            this.system.universe.system = farEnd.system;

            // Swich ship to far end.
            that.system = farEnd.system;
        }

        return(true);
    }

    getRadarColour() {
        return (COLOUR);
    }

    setupMesh() {
        // Material for this hole.
        let holeMaterial = new THREE.MeshStandardMaterial(
            {
                // color: "#101010",
                color: "white",
                roughness: 1,
                opacity: 1,
        
                map: new StarFieldTexture(RADIUS * 10, RADIUS * 10, 0.5, this.backgroundColour).getTexture(),
        
                // Show back of sphere.
                side: THREE.BackSide,
                metalness: 0,
                transparent: false,
                emissive: this.backgroundColour
            }
        )

        let holeGeom = new THREE.SphereGeometry(RADIUS, 32, 32);
        let haloGeom = new THREE.SphereGeometry(HALO_RADIUS, 32, 32);

        // compute vertex normals
        holeGeom.computeVertexNormals();
        haloGeom.computeVertexNormals();

        this.holeMesh = new THREE.Mesh(holeGeom, holeMaterial);   
        this.holeMesh.castShadow = false;
        this.holeMesh.receiveShadow = false;
        this.haloMesh = new THREE.Mesh(haloGeom, HALO_MATERIAL);
        this.haloMesh.castShadow = false;
        this.haloMesh.receiveShadow = false;

        this.addMesh(this.holeMesh);
        this.addMesh(this.haloMesh);
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
        let ar = this.getGame().getAnimateRate();
        this.holeMesh.rotateX(ROTATE_RATE / ar);
        this.haloMesh.rotateX(-ROTATE_RATE / ar);

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

        this.rotateRate.divideScalar(game.getAnimateRate() * 20);

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

export default WormholeEnd;