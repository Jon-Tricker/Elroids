// Players ship graphic and physics.
// A 'Ship' with everything implemented.

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Game from '../Game/game.js';
import Ship from './ship.js';
import MyCamera from '../Game/Scenery/myCamera.js';
import SmallHull from './Components/Hulls/smallHull.js';
import Location from '../Game/Utils/location.js';
import BasicEngine from './Components/Engines/basicEngine.js';
import DumbMissileWeapon from './Components/Weapons/dumbMissileWeapon.js';
import BasicBay from './Components/Bays/basicBay.js';
import BasicRadar from './Components/Avionics/basicRadar.js';
import BasicCompass from './Components/Avionics/basicCompass.js';
import BasicHud from './Components/Avionics/Huds/basicHud.js';
import ComponentSets from './Components/componentSets.js';

class PlayerShip extends Ship {
    // Ship cameras are creted once and permanently attached to ship. 
    // Will be added to renderer when needed.
    pilotCamera;
    chaseCamera;

    originalPosition;

    constructor(json, height, width, length, location) {
        if (undefined == json) {
            super(undefined, height, width, length, location, undefined, undefined, undefined, undefined, true);
            this.originalPosition = location.clone();
        } else {
            super(json.ship);
            this.originalPosition = new Location(json.originalPosition);
        }

        this.createCameras();
    }

    toJSON() {
        let json = new Object();
        json.ship = super.toJSON();

        //PlayerShip specific stuff.
        json.originalPosition = this.originalPosition.toJSON();

        return (json);
    }

    destruct() {
        this.remove(this.pilotCamera);
        this.pilotCamera = undefined;
        this.remove(this.chaseCamera);
        this.chaseCamera = undefined;
    }

    buildShip() {
        this.hull = new SmallHull(this.compSets.hullSet);
        this.hull.setSlots(this.compSets);

        new BasicEngine(this.compSets.engineSet);
        new DumbMissileWeapon(this.compSets.weaponSet);
        new BasicBay(this.compSets.baySet);
        new BasicRadar(this.compSets.avionicsSet);
        new BasicCompass(this.compSets.avionicsSet);
        new BasicHud(this.compSets.avionicsSet);
        // new RangeHud(this.compSets.avionicsSet);
        // new MiningHud(this.compSets.avionicsSet);

        this.recalc();
    }

    // Work round for circular dependency with Item class.
    isShip() {
        return (true);
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

    setEngineSound(state) {
        super.setEngineSound(state);
        if (true == state) {
            this.playSound("roar", 0.5, true);
        } else {
            this.stopSound("roar");
        }
    }

    animate(date, keyboard) {
        if (undefined == this.dockedWith) {
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
                    this.rollRate.zero();
                }
            }

            if (keyboard.getState("S") || keyboard.getState("s")) {
                this.climb();
            } else {
                if (keyboard.getState("X") || keyboard.getState("x")) {
                    this.dive();
                } else {
                    this.pitchRate.zero();
                }
            }

            if (keyboard.getState("Z") || keyboard.getState("z")) {
                this.yawL();
            } else {
                if (keyboard.getState("C") || keyboard.getState("c")) {
                    this.yawR();
                } else {
                    this.yawRate.zero();
                }
            }

        }

        super.animate(date);

        // Shoot after moving. So we don't run over new projectile.
        if (undefined == this.dockedWith) {
            // if (keyboard.getClearState("M") || keyboard.getClearState("m")) { 
            if (keyboard.getState("M") || keyboard.getState("m")) {
                this.shoot(date);
            }
        }
    }

    // Take damage to internal systems.
    // Ships get re-spawned so do not destruct.
    takeDamage(hits, that) {
        let msg = "Ship damaged ";
        let game = Game.getGame();

        let name = that.getName();
        if (0 < name.length) {
            msg += "by " + name.toLowerCase();
        }
        msg += "!"
        game.displays.addMessage(msg);

        // Dont call 'super'. We want to re-use the same ship. So don't want it to destruct.
        this.compSets.takeDamage(hits);

        if (this.compSets.hullSet.getAverageStatus() <= 0) {
            this.playSound('scream');
            this.setEngineSound(false);
            game.shipDestroyed(that);
        } else {
            this.playSound('clang');
        }

        this.recalc();
    }

    moveMesh() {
        // Move self (inc camera).
        let loc = this.getLocation();
        this.position.set(loc.x, loc.y, loc.z);

        // Do standard item move.
        super.moveMesh();
    }

    // Return to original state
    // NOT TESTED.
    respawn() {
        this.compSets = new ComponentSets(this);
        this.buildShip();

        // Return to start location.
        this.setLocation(this.originalPosition);
        this.rotation.set(0, 0, 0);
        this.setSpeed(new THREE.Vector3(0, 0, 0));
    }

    // Get termnal (if active)
    getTerminal() {
        return (Game.getGame().displays.terminal);
    }

    // Pick up a mineral.
    // Return true if successful.
    mineralPickup(mineral) {
        let res = super.mineralPickup(mineral)
        if (res) {
            let mass = Math.ceil(mineral.mass);
            Game.getGame().displays.addMessage("Loaded " + mineral.type.name.toLowerCase() + " " + mass + "(t)");
            this.playSound('thud');
        }
        return (res);
    }

    // Pick up a goods crate.
    // Return true if successful.
    cratePickup(crate) {
        let res = super.cratePickup(crate);
        if (res) {
            Game.getGame().displays.addMessage("Loaded " + crate.contents.number + " X " + crate.contents.getName().toLowerCase());
            this.playSound('thud');
        }
        return (res);
    }

    getPlayer() {
        return (Game.getGame().player);
    }

    getCredits() {
        return (Game.getGame().player.getCredits());
    }

    dock(station) {
        if (!super.dock(station)) {
            return (false);
        } 
        
        let game = Game.getGame();

        if (game.paused) {
            game.togglePaused();
        }

        this.getTerminal().playSound("poweroff", 0.5);
        game.displays.terminalEnable(true);

        return (true);
    }

    undock() {
        let game = Game.getGame();

        this.getTerminal().playSound("poweron", 0.5);
        if (game.paused) {
            game.togglePaused();
        }

        game.displays.terminalEnable(false);

        super.undock();
    }

    sellMineral(mineral, mass) {
        let value = Math.floor(this.location.system.spec.getMineralValue(mineral) * mass);
        this.unloadMineral(mineral, mass);
        this.getPlayer().addCredits(value);
    }
}

export default PlayerShip;