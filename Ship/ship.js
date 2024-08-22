// Ship graphic and physics

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Item from '../GameItems/item.js';
import MyCamera from '../Scenery/myCamera.js';
import BasicHull from './Components/Hulls/basicHull.js';
import Mineral from "../GameItems/mineral.js";
import Station from '../GameItems/System/station.js';
import WormholeEnd from '../GameItems/System/wormholeEnd.js';

// Slightly damped attitude contols to allow fine adjustment.
const ROTATE_RATE_DELTA = 0.125;        // r/s
const ROTATE_RATE_MAX = 5;              // r/s

class Ship extends Item {

    height;
    width;
    shipLength;

    // Ship cameras are creted once and permanently attached to ship. 
    // Will be added to renderer when needed.
    pilotCamera;
    chaseCamera;

    originalPosition;

    pitchRate = 0;
    yawRate = 0;
    rollRate = 0;

    hull;

    engineSoundOn = false;

    dockedWith = null;

    mesh;

    constructor(system, height, width, length, locationX, locationY, locationZ) {
        super(system, locationX, locationY, locationZ, 0, 0, 0, length);

        this.originalPosition = new THREE.Vector3(locationX, locationY, locationZ);

        // Now that we called 'super' can use 'this
        this.height = height;
        this.width = width;
        this.shipLength = length;

        this.buildShip();

        this.setupMesh();

        this.createCameras();
    }
    
    // Work round for circular dependency with Item class.
    isShip() {
        return(true);
    }

    // Build/Rebuild ship components.
    buildShip() {
        // Create hull
        // Will also create all other components, for that hull type, and add them to our components sets.
        this.hull = new BasicHull();
        this.hull.buildShip(this);

        // Add in weight of all components.
        this.mass = this.getMass();
    }

    // Upgrade the hull (and graphics).
    setHull(hull) {
        this.hull = hull;
        this.setupMesh();
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

    getCurrentHp() {
        return (this.hull.compSets.getCurrentHp());
    }

    setupMesh() {
        if (undefined != this.mesh) {
            this.remove(this.mesh);
        }

        this.mesh = this.hull.getMesh();
        this.add(this.mesh);
    }

    accelerate() {
        let xDirection = this.getOrientation();

        let thrust = this.hull.compSets.engineSet.getThrust();
        if (0 < thrust) {
            this.hull.setFlameState(true);
            this.setEngineSound(true);
            this.thrust(thrust, xDirection, this.hull.compSets.hullSet.getMaxSpeed());
        } else {
            this.hull.setFlameState(false);
            this.setEngineSound(false);
        }
    }

    setEngineSound(state) {
        if (true == state) {
            this.playSound("roar", 0.5, true);
        } else {
            this.stopSound("roar");
        }
        this.engineSoundOn = state;
    }

    deceletarte() {
        if (1 > this.speed.length()) {
            // Stop
            this.speed.multiplyScalar(0);
            this.setEngineSound(false);
            return;
        }

        // Thrust in opposite direction to speed.
        let xDirection = this.speed.clone();
        xDirection.multiplyScalar(-1);

        let thrust = this.hull.compSets.engineSet.getThrust();
        if (0 < thrust) {
            this.setEngineSound(true);
            this.thrust(thrust, xDirection, this.hull.compSets.hullSet.getMaxSpeed());
        } else {
            this.setEngineSound(false);
        }
    }

    // In general to rotate. Asjust relative to our own axis.
    // Positive is clockwise when looking at the origin. So needs to be reversed for roll and pitch when we a re looking away from origin.
    rollL() {
        if (this.rollRate > -ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.rollRate -= ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateX(this.rollRate);
    }

    rollR() {
        if (this.rollRate < ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.rollRate += ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateX(this.rollRate);
    }

    climb() {
        if (this.pitchRate > -ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.pitchRate -= ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateY(this.pitchRate);
    }

    dive() {
        if (this.pitchRate < ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.pitchRate += ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateY(this.pitchRate);
    }

    yawL() {
        if (this.yawRate < ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.yawRate += ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateZ(this.yawRate);
    }

    yawR() {
        if (this.yawRate > -ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.yawRate -= ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateZ(this.yawRate);
    }

    animate(date, keyboard) {

        if (null == this.dockedWith) {
            // Handle movement keys
            if (keyboard.getState(" ")) {
                this.accelerate();
            } else {
                this.hull.setFlameState(false);
            }

            if (keyboard.getState("?") || keyboard.getState("/")) {
                this.deceletarte();
            }

            if (!keyboard.getState(" ") && !keyboard.getState("?") && !keyboard.getState("/") && this.engineSoundOn) {
                this.setEngineSound(false);
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
                this.hull.compSets.weaponSet.fire(this.getOrientation(), date);
            }

            this.moveItem(true);
            this.moveMesh();
        }
    }

    // Move mesh in graphics space. Will be relative to ship position.
    //
    // Appear to need a simple version here. IF WE USE SUPER VERSION RADAR BECOMES DETACHED DURING WRAP. Not quite sure why.
    moveMesh() {
        this.position.set(this.location.x, this.location.y, this.location.z);
    }


    // Take damage to self.
    // Ships get re-spawned so do not destruct.
    takeDamage(hits, that) {
        let msg = "Ship damaged ";
        if (0 < that.getClass().length) {
            msg += "by " + that.getClass().toLowerCase();
        }
        msg += "!"
        this.getGame().displays.addMessage(msg);

        // Dont call 'super'. We want to re-use the same ship. So don't want it to destruct.
        this.hull.compSets.takeDamage(hits);

        if (this.hull.compSets.hullSet.getAverageStatus() <= 0) {
            this.playSound('scream');
            this.setEngineSound(false);

            // new Explosion(this.size, this);
            this.game.shipDestroyed(that);
        } else {
            this.playSound('clang');
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
        that.takeDamage(this.getRamDamage(), this);
    }

    // Get cargo bay
    getBays() {
        return (this.hull.compSets.baySet);
    }

    // Get termnal (if active)
    getTerminal() {
        return (this.getGame().displays.terminal);
    }

    // Pick up a mineral.
    // Return true if successful.
    mineralPickup(mineral) {
        let mass = Math.ceil(mineral.mass);
        this.getGame().displays.addMessage("Loaded " + mineral.type.name + " " + mass + "(t)");
        this.playSound('thud');
        this.loadMineral(mineral.type, mass);
        mineral.destruct();
        return (true);
    }

    // Load component into bay.
    loadComponent(comp) {
        this.hull.compSets.baySet.loadComponent(comp);
    }

    // Unload component from bay.
    unloadComponent(comp) {

    }

    addCredits(score) {
        this.getGame().player.addCredits(score);
        if (0 < score) {
            this.playSound('coin');
        }
    }

    getCredits() {
        return (this.getGame().player.getCredits());
    }

    handleCollision(that) {
        // Can't get hit while docked.
        if (null != this.dockedWith) {
            return (false)
        }

        if (that instanceof Mineral) {
            return (this.mineralPickup(that));
        }

        if (that instanceof Station) {
            if (that.collideWithShip(this)) {
                return;
            }
        }

        if (that instanceof WormholeEnd) {
            // Try to raverse wormhole.
            that.enter(this);
            return;
        }

        return (super.handleCollision(that));
    }

    dock(station) {
        this.getTerminal().playSound("poweroff", 0.5);

        this.dockedWith = station;
        this.setSpeed(new THREE.Vector3(0, 0, 0));

        // While docked move with station.
        station.add(this);

        // Move to the centre of the bay. Use station relative coordinates.
        this.location = station.bayMesh.position.clone();
        // this.moveMesh();

        // Rotate to face exit.
        this.rotation.set(0, 0, Math.PI);

        this.getGame().displays.terminalEnable(true);
    }

    undock() {
        let game = this.getGame();

        this.getTerminal().playSound("poweron", 0.5);
        if (game.paused) {
            game.togglePaused();
        }

        game.displays.terminalEnable(false);

        this.dockedWith.remove(this);

        // Move back to univeral coordinates.
        let launchPos = this.dockedWith.getLaunchPoint();
        this.location = this.dockedWith.localToWorld(launchPos);
        this.moveMesh();

        // Rotate to face away from exit.
        this.rotation.set(this.dockedWith.rotation.x, this.dockedWith.rotation.y, this.dockedWith.rotation.z + Math.PI);

        this.dockedWith = null;

        // It appears that, having been part of another group, 'this' needs to be added back to the scene. 
        // Otherwise camera cannot see it's mesh.
        game.getScene().add(this);

        this.moveItem(false);
    }

    dockedTo() {
        return (this.dockedWith);
    }

    loadMineral(mineral, mass) {
        this.hull.compSets.baySet.loadMineral(mineral, mass);
    }

    // Return mass unloaded.
    unloadMineral(mineral, mass) {
        return (this.hull.compSets.baySet.unloadMineral(mineral, mass));
    }

    sellMineral(mineral, mass) {
        let value = mineral.value * mass;
        this.unloadMineral(mineral, mass);
        this.addCredits(value);
    }

    getCargoCapacity() {
        return (this.hull.compSets.baySet.capacity)
    }

    getCargo() {
        return (this.hull.compSets.baySet)
    }

    getMass() {
        return (this.hull.compSets.getMass());
    }

    getTotalMass() {
        return (this.getMass() + this.hull.compSets.baySet.getContentMass())
    }
}

export default Ship;