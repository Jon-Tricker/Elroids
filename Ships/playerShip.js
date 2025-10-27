// Players ship graphic and physics.
// A 'Ship' with everything implemented.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Ship from './ship.js';
import MyCamera from '../Game/Scenery/myCamera.js';
import BasicHull from './Components/Hulls/basicHull.js';
import MediumHull from './Components/Hulls/mediumHull.js';
import LargeHull from './Components/Hulls/largeHull.js';
import Mineral from "../GameItems/mineral.js";
import Station from '../GameItems/System/station.js';
import WormholeEnd from '../GameItems/System/wormholeEnd.js';
import GoodsCrate from '../Trade/goodsCrate.js';
import Location from '../Game/Utils/location.js';


class PlayerShip extends Ship {

    // Ship cameras are creted once and permanently attached to ship. 
    // Will be added to renderer when needed.
    pilotCamera;
    chaseCamera;

    originalPosition;

    constructor(height, width, length, location) {

        super(height, width, length, location);

        this.originalPosition = location.clone();

        this.buildShip();

        this.createCameras();
    }

    toJSON() {
        let json = super.toJSON();

        return (json);
    }

    static fromJSON(json, system) {
        // Make a default ship.
        // Default components will be made. We will replace them latter. 
        let newShip = new PlayerShip(json.height, json.width, json.length, Location.fromJSON(json.location, system));

        super.fromJSON(json, system, newShip);

        return (newShip);
    }

    // Work round for circular dependency with Item class.
    isShip() {
        return (true);
    }

    // Build/Rebuild ship components.
    buildShip() {
        // Create hull
        // Will also create all other components, for that hull type, and add them to our components sets.
        this.hull = new BasicHull();
        // this.hull = new MediumHull();
        //this.hull = new LargeHull();

        this.hull.buildShip(this);

        // Add in weight of all components.
        this.mass = this.getMass();
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

    // Get total available thrust
    getThrust() {
        return (this.hull.compSets.engineSet.getThrust());
    }

    getMaxSpeed() {
        return (this.hull.compSets.hullSet.getMaxSpeed());
    }

    setEngineSound(state) {
        super.setEngineSound(state);
        if (true == state) {
            this.playSound("roar", 0.5, true);
        } else {
            this.stopSound("roar");
        }
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
                this.decelerate();
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
        }

        super.animate(date);
    }

    // Take damage to internal systems.
    // Ships get re-spawned so do not destruct.
    takeDamage(hits, that) {
        let msg = "Ship damaged ";

        let name = that.getName();
        if (0 < name.length) {
            msg += "by " + name.toLowerCase();
        }
        msg += "!"
        this.getGame().displays.addMessage(msg);

        // Dont call 'super'. We want to re-use the same ship. So don't want it to destruct.
        this.hull.compSets.takeDamage(hits);

        if (this.hull.compSets.hullSet.getAverageStatus() <= 0) {
            this.playSound('scream');
            this.setEngineSound(false);

            // new Explosion(this.size, this);
            this.getGame().shipDestroyed(that);
        } else {
            this.playSound('clang');
        }
    }

    moveMesh() {
        // Move self (inc camera).
        let loc = this.getLocation();
        this.position.set(loc.x, loc.y, loc.z);

        // Do standard item move.
        super.moveMesh();
    }

    // Return to original state
    respawn() {
        // Repair damaged components.
        this.buildShip();

        // Return to start location.
        this.setLocation(this.originalPosition);
        this.rotation.set(0, 0, 0);
        this.setSpeed(new THREE.Vector3(0, 0, 0));
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
        let res = super.mineralPickup(mineral)
        if (res) {
            this.getGame().displays.addMessage("Loaded " + mineral.type.name + " " + mass + "(t)");
            this.playSound('thud');
        }
        return (res);
    }

    // Pick up a goods crate.
    // Return true if successful.
    cratePickup(crate) {
        this.getGame().displays.addMessage("Loaded " + crate.contents.number + " X " + crate.contents.getName());

        // Store goods
        let res = super.cratePickup(crate);
        this.playSound('thud');
        return (res);
    }

    // Load goods into bay.
    loadGoods(goods) {
        this.hull.compSets.baySet.loadGoods(goods);
    }

    addCredits(score) {
        this.getGame().player.addCredits(score);
        if (0 < score) {
            this.playSound('coin');
        } else {
            this.playSound('till');
        }
    }

    getCredits() {
        return (this.getGame().player.getCredits());
    }

    handleCollision(that) {
        if (that instanceof Mineral) {
            return (this.mineralPickup(that));
        }

        if (that instanceof GoodsCrate) {
            return (this.cratePickup(that));
        }

        if (that instanceof Station) {
            if (that.collideWithShip(this)) {
                return;
            }
        }

        if (that instanceof WormholeEnd) {
            // Try to traverse wormhole.
            return (that.enter(this));
        }

        return (super.handleCollision(that));
    }

    dock(station) {
        if (!super.dock(station)) {
            return (false);
        }

        this.getTerminal().playSound("poweroff", 0.5);
        this.getGame().displays.terminalEnable(true);

        return (true);
    }

    undock() {
        let game = this.getGame();

        this.getTerminal().playSound("poweron", 0.5);
        if (game.paused) {
            game.togglePaused();
        }

        game.displays.terminalEnable(false);

        super.undock();
    }

    loadMineral(mineral, mass) {
        this.hull.compSets.baySet.loadMineral(mineral, mass);
    }

    // Return mass unloaded.
    unloadMineral(mineral, mass) {
        return (this.hull.compSets.baySet.unloadMineral(mineral, mass));
    }

    sellMineral(mineral, mass) {
        let value = Math.floor(this.location.system.spec.getMineralValue(mineral) * mass);
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

export default PlayerShip;