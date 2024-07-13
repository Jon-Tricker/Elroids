// Game mechanics

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

import Ship from "./Ship/ship.js";
import Rock from "./GameItems/rock.js";
import GameError from "./GameErrors/gameError.js"

import SaucerWanderer from "./GameItems/Saucers/saucerWanderer.js";
import SaucerShooter from "./GameItems/Saucers/saucerShooter.js";
import SaucerStatic from "./GameItems/Saucers/saucerStatic.js";
import SaucerMother from "./GameItems/Saucers/saucerMother.js";
import SaucerRam from "./GameItems/Saucers/saucerRam.js";
import SaucerHunter from "./GameItems/Saucers/saucerHunter.js";
import SaucerPirate from "./GameItems/Saucers/saucerPirate.js";

import Universe from './universe.js'
import MyScene from './Scenery/myScene.js'
import MyCamera from './Scenery/myCamera.js'
import Displays from './Displays/displays.js'
import Keyboard from "./keyboard.js";
import Mineral from "./GameItems/mineral.js";
import Station from "./GameItems/station.js";
import { MineralTypes } from './GameItems/minerals.js';
import PurchaseList from './Ship/Components/purchaseList.js';
import DumbMissileWeapon from './Ship/Components/Weapons/dumbMissileWeapon.js';
import BasicBay from './Ship/Components/Bays/basicBay.js';

const MAX_ROCK_VELOCITY = 25;       // m/s
const MAX_ROCK_SIZE = 40;           // m
const VERSION = "4.4";

// Box to clear out arround respawn site.
const RESPAWN_SIZE = 250;          // m

class Game {
    // Probably the wrong place for this.
    ship;
    scene;
    displays;
    player;

    safe = false;

    rockStyle;

    maxRockCount;
    rockCount = 0;

    soundOn = false;

    testMode = false;

    saucerCount = 0;
    motherSaucerCount = 0;

    // Gradually increasing saucer number limit.
    maxSaucerCount = 5;

    paused = false;

    purchaseList = new PurchaseList();

    constructor(maxRockCount, rockStyle, safe, player, soundOn) {

        this.safe = safe;
        this.player = player;

        if ((soundOn != null) && (soundOn.toLowerCase() == "true")) {
            this.soundOn = true;
        }

        if (0 == maxRockCount) {
            this.testMode = true;

            // Give us some cash
            player.addCredits(1234);
            // player.addCredits(105);
        }

        Rock.setRockStyle(rockStyle);

        // Create the scene
        this.scene = new MyScene(this, (0 == maxRockCount));

        // Create items.
        // Create ship first so it is 1st, for collision detection purposes,  in the item list.
        this.maxRockCount = maxRockCount;
        this.createRocks(maxRockCount);
        this.createShip();
        this.createSaucers();

        // Create displays
        this.displays = new Displays(this);
        this.displays.resize();

        // this.createStation();
        this.createStation(this.ship);

        // Now we have a ship. Switch to it's camera
        this.scene.setCamera(MyCamera.PILOT);

        // First call of animation loop.
        this.loop();
    }

    createShip() {
        if (this.testMode) {
            this.ship = new Ship(5, 10, 20, 0, 0, 0, this);

            // Do some damage
            this.ship.hull.compSets.takeDamage(1);

            // Add some minerals to the cargo.
            for (let i = 1; i < 3; i++) {
                let type = 1 + Math.floor(Math.random() * (MineralTypes.length - 1));
                this.ship.loadMineral(MineralTypes[type], i);
            }

            // Add some components to cargo.
            let comp = new DumbMissileWeapon().buy(this.ship, true);
            comp.takeDamage(1);

            // Add another cargo bay
            let bay = new BasicBay();
            bay = bay.mount(this.ship, true);
            bay.takeDamage(1);
        } else {
            this.ship = new Ship(5, 10, 20, -200, 100, 0, this);
        }

    }

    shipDestroyed() {
        if (this.player.killed()) {
            this.displays.addMessage("Ship destroyed! ... restarting", 3000);

            this.clearRespawnArea();

            this.ship.respawn();
        } else {
            this.ship.destruct();
            this.displays.addMessage("Game Over! ... Refresh page to play again.", 0);
        }
    }

    getVersion() {
        return (VERSION);
    }

    getScene() {
        return (this.scene);
    }

    getPlayer() {
        return (this.player);
    }

    createStation(ship) {
        let station;
        if (this.testMode) {
            station = new Station(1100, 0, 0, this, null);
            // new Station(200, 0, 0, this, null);
        } else {
            station = new Station(0, 0, 0, this, null);
        }

        // Doc a ship if given.
        if ((undefined != ship) && this.testMode) {
            ship.dock(station);
        }
    }

    createSaucers() {
        if (this.testMode) {
            // New saucer
            new SaucerStatic(200, 100, -50, this, false);
            new SaucerWanderer(400, 100, -50, this, null, false);
            new SaucerShooter(300, 100, -50, this, null, true);
            new SaucerHunter(300, 200, -50, this, null, true);
            new SaucerRam(1000, 200, 200, this, null, true);
            new SaucerPirate(1500, 200, -50, this, null, true);
            this.motherSaucer = new SaucerMother(1000, 100, -50, this, null, true);
        } else {
            // First mother ship always in safe mode.
            this.createMotherSaucer(true);
        }
    }

    createRocks(rockCount, rockStyle) {
        if (this.testMode) {
            // Create a few test rocks at set locations

            // Horizontal colliders
            new Rock(20, 100, 50, 0, 0, 0, 0, this);
            new Rock(10, 100, -50, 10, 0, 25, 0, this);

            // Big target
            // new Rock(20, 100, 0, 0, 0, 0, 0, this);

            // Small target
            // new Rock(80, -100, 0, 0, 0, 0, 0, this);

            // Row of rocks
            for (let i = -Universe.UNI_SIZE; i < Universe.UNI_SIZE; i += 211) {
                let sz = Math.abs(i % MAX_ROCK_SIZE);
                if (sz != 0) {
                    new Rock(sz, i, -100, 0, 0, 0, 0, this);
                }
            }

            // Diagonal row of rocks.
            /*
            for (let i = 0; i < Universe.UNI_SIZE; i += 211) {
                let sz = i % MAX_ROCK_SIZE;
                new Rock(sz,  i, i, i, 0, 0, 0, this);
            }
            */

            // And a sample mineral
            new Mineral(100, 250, -10, 50, 0, 0, 0, this, MineralTypes[2]);
            new Mineral(100, 500, 50, 50, 0, 0, 0, this, MineralTypes[3]);

        } else {
            // Create a bunch of random rocks
            for (let r = 0; r <= rockCount; r++) {
                let loc = new THREE.Vector3(Math.random() * Universe.UNI_SIZE * 2 - Universe.UNI_SIZE, Math.random() * Universe.UNI_SIZE * 2 - Universe.UNI_SIZE, Math.random() * Universe.UNI_SIZE * 2 - Universe.UNI_SIZE);
                this.createRandomRock(loc);
            }

            this.clearRespawnArea();
        }
    }

    createRandomRock(loc) {
        let vx = (Math.random() * MAX_ROCK_VELOCITY * 2) - MAX_ROCK_VELOCITY;
        let vy = (Math.random() * MAX_ROCK_VELOCITY * 2) - MAX_ROCK_VELOCITY;
        let vz = (Math.random() * MAX_ROCK_VELOCITY * 2) - MAX_ROCK_VELOCITY;
        let sz = Math.floor((Math.random() * MAX_ROCK_SIZE) + 10);

        new Rock(sz, loc.x, loc.y, loc.z, vx, vy, vz, this);
    }

    clearRespawnArea() {
        Universe.clearBox(-RESPAWN_SIZE, -RESPAWN_SIZE, -RESPAWN_SIZE, RESPAWN_SIZE, RESPAWN_SIZE, RESPAWN_SIZE);
    }

    createRandomVector(max) {
        return (new THREE.Vector3(Math.random() * max * 2 - max, Math.random() * max * 2 - max, Math.random() * max * 2 - max));
    }

    createMotherSaucer(safe) {
        let loc;

        // Create it close so we can find it.
        if (safe) {
            loc = this.ship.location.clone();
            let offset = 1000;
            loc.x += offset;
            loc.y += offset / 2;
            Universe.handleWrap(loc);
        } else {
            loc = this.getFarAway(this.ship.location);
        }
        new SaucerMother(loc.x, loc.y, loc.z, this, null, safe);

        this.motherSaucerCount++;

        // Game gradually gets harder.
        this.maxSaucerCount++;
    }

    // Get a random location far away from ship. 
    //Let wrap calculation take care if too big.
    getFarAway(location) {
        let loc = location.clone();

        let delta = this.createRandomVector(Universe.UNI_SIZE);

        // Move it to one edge of the universe.
        switch (Math.floor(Math.random()) * 3) {
            case 0:
                delta.x += Universe.UNI_SIZE;
                break;

            case 1:
                delta.y += Universe.UNI_SIZE;
                break;

            case 2:
            default:
                delta.z += Universe.UNI_SIZE;
                break;
        }

        loc.add(delta);

        Universe.handleWrap(loc);

        return (loc);
    }

    removeMotherSaucer() {
        // console.log("MS destoryed");
        this.motherSaucerCount--;
    }

    getShip() {
        return (this.ship);
    }

    togglePaused() {
        this.paused = !this.paused;
        if (null == this.getShip().dockedWith) {
            this.displays.terminalEnable(this.paused);
        }
    }

    animate(date) {

        // If necesarry top up rocks.
        if (this.rockCount < this.maxRockCount) {
            this.createRandomRock(this.getFarAway(this.ship.location));
        }

        if (Keyboard.getClearState("P") || Keyboard.getClearState("p")) {
            this.togglePaused();
        }

        if (!this.paused) {
            if (!this.testMode) {
                // If mother saucer detroyed periodicaly re-create
                if (0 == this.motherSaucerCount) {
                    if ((Math.random() * 1000) < 1) {
                        this.createMotherSaucer(this.safe);
                    }
                }
            }

            Universe.animate(date, Keyboard);
            this.scene.animate();
        }
        this.displays.animate(Universe.getTime(), Keyboard);
    }

    // Add animation loop to handle re-rendering.
    // If this is not done when window re-sizes old render will get 'squashed'
    // and loose aspect ratio.
    loop = () => {
        let date = Date.now();

        try {
            // Update displays
            this.animate(date);
        }
        catch (e) {
            if (e instanceof GameError) {
                this.displays.addMessage(e.message);
            } else {
                throw (e);
            }
        }

        // Re-request self
        window.requestAnimationFrame(this.loop);
    }


}

export default Game;