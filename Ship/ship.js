// Ship graphic and physics

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Item from '../GameItems/item.js';
import MyCamera from '../Scenery/myCamera.js';
import DumbMissile from '../GameItems/dumbMissile.js';
import Universe from '../universe.js'
import EngineSet from './Components/Engines/engineSet.js';
import BasicEngine from './Components/Engines/basicEngine.js';
import HullSet from './Components/Hulls/hullSet.js';
import BasicHull from './Components/Hulls/basicHull.js';

// Create ship material.
const shipMaterial = new THREE.MeshStandardMaterial(
    {
        color: "#B0B0B0",
        roughness: 0.2,
        opacity: 1,
        // map: texture,
        // roughnessMap: texture,
        // bumpMap: texture,
        metalness: 0.8,
    }
)

// Create engine material.
const engineMaterial = new THREE.MeshStandardMaterial(
    {
        color: "#202020",
        //color: "#ffffff",
        roughness: 0.9,
        opacity: 1,
        // map: texture,
        // roughnessMap: texture,
        // bumpMap: texture,
        metalness: 0.1,
        side: THREE.DoubleSide,
    }
)

// Create flame material.
const flameMaterial = new THREE.MeshStandardMaterial(
    {
        // TODO ... Seems to loose the color when made transparent.
        color: "yellow",
        roughness: 0.9,

        // Full transprent when off.
        transparent: true,
        opacity: 0,

        // map: texture,
        // roughnessMap: texture,
        // bumpMap: texture,
        metalness: 0.1,
    }
)

const MAXSPEED = 100;       // m/s. Must be slower tha missiles so cannot run them over.

// Slightly damped attitude contols to allow fine adjustment.
const ROTATE_RATE_DELTA = 0.125;        // r/s
const ROTATE_RATE_MAX = 5;              // r/s

// Missiles/s
const FIRE_RATE = 4;

class Ship extends Item {

    height;
    width;
    shipLength;

    // Ship cameras are creted once and permanently attached to ship. 
    // Will be added to renderer when needed.
    pilotCamera;
    chaseCamera;

    fireLast = Universe.getTime();

    originalPosition;

    pitchRate = 0;
    yawRate = 0;
    rollRate = 0;

    // Ship components
    compSets;
    engineSet;
    hullSet;

    constructor(height, width, length, locationX, locationY, locationZ, game) {
        super(locationX, locationY, locationZ, 0, 0, 0, game, length);

        this.originalPosition = new THREE.Vector3(locationX, locationY, locationZ);

        // Now that we called 'super' can use 'this
        this.height = height;
        this.width = width;
        this.shipLength = length;

        this.setupMesh();

        this.buildShip();

        this.createCameras();
    }

    // Build/Rebuild ship components.
    buildShip() {
        this.engineSet = new EngineSet();
        this.engineSet.add(new BasicEngine());

        this.hullSet = new HullSet();
        this.hullSet.add(new BasicHull());
        this.hitPoints = this.hullSet.getHp();

        // Build set of all componets sets
        this.compSets = new Set();
        this.compSets.add(this.engineSet);
        this.compSets.add(this.hullSet);

        // Add in weight of all components.
        this.calculateMass();
    }

    calculateMass() {
        for(const set of this.compSets) {
            this.mass += set.getMass();
        }
    }

    createCameras() {
        let sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
        }

        this.pilotCamera = new MyCamera(sizes, MyCamera.PILOT, this);
        this.chaseCamera = new MyCamera(sizes, MyCamera.CHASE, this);

        // Add cameras to ship. So they move with it.
        this.add(this.pilotCamera);
        this.add(this.chaseCamera);
    }

    getPilotCamera() {
        return (this.pilotCamera);
    }

    getChaseCamera() {
        return (this.chaseCamera);
    }

    setupMesh() {
        let ratio = 2 / 1.5;

        // Save a few 'this.'s
        let length = this.shipLength;
        let height = this.height;
        let width = this.width;

        let vertices = new Float32Array([
            length, 0, 0, // v0 nose
            -length, width * ratio, height * ratio,// v1 left fin top
            -length, width * 2, 0, // v2 left fin mid
            -length, width * ratio, -height * ratio,// v3 left fin bottom
            -length * 0.5, width, height,// v4 cemtre left top
            -length * 0.5, width, -height, // v5 center left bottom
            -length * 0.5, -width, height, // v6 cemter right top
            -length * 0.5, -width, -height,// v7 center right bottom
            -length, -width * ratio, height * ratio,// v8  right fin top
            -length, -width * 2, 0,// v9 right fin mid
            -length, -width * ratio, -height * ratio,// v10 right fin bottom
            -length * 0.5, width, 0, // v11 centre left mid
            -length * 0.5, -width, 0, // v12 centre right mid
        ]);

        let indices = [
            0, 2, 1, // left fin top
            0, 3, 2, // left fin bottom
            0, 4, 6,// center top
            0, 7, 5,// centre bottom
            0, 8, 9, // rt fin top
            0, 9, 10,// rt fin bottom
            5, 6, 4, // back plate A
            6, 5, 7,// back plate B
            1, 2, 11,// fin left inner top A
            11, 4, 1,// fin left inner top B
            3, 11, 2,// fin left inner bottom A
            11, 3, 5,// fin left inner bottom B
            8, 12, 9,// fin right inner top A
            12, 8, 6,// fin right inner top B
            10, 9, 12,// fin right inner bottom A
            12, 7, 10,// fin right inner top bottom

        ];

        let bodyGeometry = new THREE.BufferGeometry();

        bodyGeometry.setIndex(indices);
        bodyGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // compute vertex normals
        bodyGeometry.computeVertexNormals();

        let bodyMesh = new THREE.Mesh(bodyGeometry, shipMaterial);

        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;

        // Add the engine cone
        var engineWidth = width;
        if (height < width) {
            engineWidth = height;
        }
        let engineGeometry = new THREE.ConeGeometry(engineWidth, length, 20, 1, true);

        // compute vertex normals
        engineGeometry.computeVertexNormals();
        let engineMesh = new THREE.Mesh(engineGeometry, engineMaterial);

        // Mount engine
        engineMesh.rotateZ(-Math.PI / 2);
        engineMesh.position.set(-length * 0.25, 0, height * .25);

        engineMesh.castShadow = true;
        engineMesh.receiveShadow = true;

        var thrusterWidth = engineWidth * 0.5;
        let thrusterGeometry = new THREE.ConeGeometry(thrusterWidth, length / 2, 10, 1, true);

        // compute vertex normals
        thrusterGeometry.computeVertexNormals();
        let thrusterMaterialL = engineMaterial.clone();
        thrusterMaterialL.color.setHex(0x800000);
        let thrusterMeshL = new THREE.Mesh(thrusterGeometry, thrusterMaterialL);

        // Mount engine
        thrusterMeshL.rotateZ(-Math.PI / 2);
        thrusterMeshL.position.set(-length * 0.5, width * 0.75, height * -.25);

        thrusterMeshL.castShadow = true;
        thrusterMeshL.receiveShadow = true;


        let thrusterMaterialR = engineMaterial.clone();
        thrusterMaterialR.color.setHex(0x008000);
        let thrusterMeshR = new THREE.Mesh(thrusterGeometry, thrusterMaterialR);

        // Mount engine
        thrusterMeshR.rotateZ(-Math.PI / 2);
        thrusterMeshR.position.set(-length * 0.5, -width * 0.75, height * -.25);

        thrusterMeshR.castShadow = true;
        thrusterMeshR.receiveShadow = true;

        // Add the flame cone
        let flameGeometry = new THREE.ConeGeometry(engineWidth * 0.75, length, 20, 1, false);

        // compute vertex normals
        flameGeometry.computeVertexNormals();
        this.flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);

        // Position flame
        this.flameMesh.rotateZ(Math.PI / 2);
        this.flameMesh.position.set(-length, 0, height * .25);


        // Create the group
        this.add(bodyMesh);
        this.add(engineMesh);
        this.add(thrusterMeshL);
        this.add(thrusterMeshR);

        this.add(this.flameMesh);
    }

    accelerate() {
        // Flame on 
        if (flameMaterial.transparent) {
            flameMaterial.transparent = false;
            flameMaterial.color = "red";
        }

        let xDirection = this.getOrientation();

        // Thrust in kN, mass in Tonnes. This should work without scaling.
        let accRate = this.engineSet.getThrust()/this.hullSet.getMass();

        let newSpeed = this.speed.clone();
        newSpeed.addScaledVector(xDirection, accRate/Universe.getAnimateRate());

        if (newSpeed.length() > MAXSPEED) {
            newSpeed = newSpeed.normalize().multiplyScalar(MAXSPEED);
        }

        this.setSpeed(newSpeed);
    }

    deceletarte() {
        let newSpeed = this.speed.clone();
        if ((this.speed.length()/Universe.getAnimateRate()) > this.engineSet.getDecRate()) {
            // Slow down in all directions.
            newSpeed.multiplyScalar(1 - (this.engineSet.getDecRate()/Universe.getAnimateRate()));
        } else {
            // Stop
            newSpeed.multiplyScalar(0);
        }
        this.setSpeed(newSpeed);
    }

    // In general to rotate. Asjust relative to our own axis.
    // Positive is clockwise when looking at the origin. So needs to be reversed for roll and pitch when we a re looking away from origin.
    rollL() {
        if (this.rollRate > -ROTATE_RATE_MAX/Universe.getAnimateRate()) {
            this.rollRate -= ROTATE_RATE_DELTA/Universe.getAnimateRate();
        }
        this.rotateX(this.rollRate);
    }

    rollR() {
        if (this.rollRate < ROTATE_RATE_MAX/Universe.getAnimateRate()) {
            this.rollRate += ROTATE_RATE_DELTA/Universe.getAnimateRate();
        }
        this.rotateX(this.rollRate);
    }

    climb() {
        if (this.pitchRate > -ROTATE_RATE_MAX/Universe.getAnimateRate()) {
            this.pitchRate -= ROTATE_RATE_DELTA/Universe.getAnimateRate();
        }
        this.rotateY(this.pitchRate);
    }

    dive() {
        if (this.pitchRate < ROTATE_RATE_MAX/Universe.getAnimateRate()) {
            this.pitchRate += ROTATE_RATE_DELTA/Universe.getAnimateRate();
        }
        this.rotateY(this.pitchRate);
    }

    yawL() {
        if (this.yawRate < ROTATE_RATE_MAX/Universe.getAnimateRate()) {
            this.yawRate += ROTATE_RATE_DELTA/Universe.getAnimateRate();
        }
        this.rotateZ(this.yawRate);
    }

    yawR() {
        if (this.yawRate > -ROTATE_RATE_MAX/Universe.getAnimateRate()) {
            this.yawRate -= ROTATE_RATE_DELTA/Universe.getAnimateRate();
        }
        this.rotateZ(this.yawRate);
    }

    animate(date, keyboard) {
        // Handle movement keys
        if (keyboard.getState(" ")) {
            this.accelerate();
        } else {
            // Flame off.
            if (!flameMaterial.transparent) {
                flameMaterial.transparent = true;
            }
        }

        if (keyboard.getState("?") || keyboard.getState("/")) {
            this.deceletarte();
        }

        if (keyboard.getState("<") || keyboard.getState(",")) {
            this.rollL();
        } else {
            if (keyboard.getState(">") || keyboard.getState(".")) {
                this.rollR();
            } else {
                this.rollRate = 0;
            }
        }

        if (keyboard.getState("S") || keyboard.getState("s")) {
            this.climb();
        } else {
            if (keyboard.getState("X") || keyboard.getState("x")) {
                this.dive();
            } else {
                this.pitchRate = 0;
            }
        }

        if (keyboard.getState("Z") || keyboard.getState("z")) {
            this.yawL();
        } else {
            if (keyboard.getState("C") || keyboard.getState("c")) {
                this.yawR();
            } else {
                this.yawRate = 0;
            }
        }

        // if (keyboard.getClearState("M") || keyboard.getClearState("m")) { 
        if (keyboard.getState("M") || keyboard.getState("m")) {
            if (Universe.getTime() > this.fireLast + 1000 / FIRE_RATE) {
                let missile = new DumbMissile(this.getOrientation(), this);
                this.fireLast = Universe.getTime();
            }
        }

        this.moveItem(true);
        this.moveMesh();
    }

    // Move mesh in graphics space. Will be relative to ship position.
    moveMesh() {
        this.position.set(this.location.x, this.location.y, this.location.z);
    }

    // Take damage to self.
    // Ships get re-spawned so do not destruct.
    takeDamage(hits, that) {
        // Dont call 'super'. We want to re-use the same ship. So don't want it to destruct.
        this.hullSet.takeDamage(hits);
        this.hitPoints = this.hullSet.getHp();

        if (this.hitPoints > 0) {
            this.game.displays.setMessage("Ship damaged!", 1000);
        } else {
            this.game.shipDestroyed();
        }
    }

    // Return to original state
    respawn() {
        // Repair damaged components.
        this.buildShip();

        // Return to start location.
        this.location.set(this.originalPosition.x, this.originalPosition.y, this.originalPosition.x);
        this.rotation.set(0, 0, 0);
        this.setSpeed(new THREE.Vector3(0, 0, 0));
    }

    // Some on line magic to get the current directions X access
    getOrientation() {
        let e = this.matrixWorld.elements;
        let xDirection = new THREE.Vector3();
        xDirection.set(e[0], e[1], e[2])
        xDirection = xDirection.normalize()
        return (xDirection);
    }

    // Ships do some dameage when they ram things.
    // Todo: Maybe should be based on mass and speed.
    doDamage(that) {
        that.takeDamage(this.hullSet.getRamDamage(), this);
    }

}

export default Ship;