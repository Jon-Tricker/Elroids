// Game mechanics

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

import Ship from "./Ship/ship.js";
import Rock from "./GameItems/rock.js";

import SaucerWanderer from "./GameItems/Saucers/saucerWanderer.js";
import SaucerShooter from "./GameItems/Saucers/saucerShooter.js";
import SaucerStatic from "./GameItems/Saucers/saucerStatic.js";
import SaucerMother from "./GameItems/Saucers/saucerMother.js";
import SaucerRam from "./GameItems/Saucers/saucerRam.js";
import SaucerHunter from "./GameItems/Saucers/saucerHunter.js";

import Universe from './universe.js'
import MyScene from './Scenery/myScene.js'
import MyCamera from './Scenery/myCamera.js'
import Displays from './Displays/displays.js'
import Keyboard from "./keyboard.js";

const MAX_ROCK_VELOCITY = 25;       // m/s
const MAX_ROCK_SIZE = 80;           // m
const VERSION = "1.1";

// Box to clear out arround respawn site.
const RESPAWN_SIZE = 1000;          // m

class Game {
    // Probably the wrong place for this.
    ship;
    scene;
    displays;
    player;

    safe = false;

    rockStyle;

    testMode = false;

    saucerCount = 0;
    motherSaucerCount = 0;

    // Gradually increasing saucer number limit.
    maxSaucerCount = 5;

    paused = false;

    constructor(rockCount, rockStyle, safe, player) {

        this.safe = safe;
        this.player = player;

        if (0 == rockCount) {
            this.testMode = true;
        }

        Rock.setRockStyle(rockStyle);

        // Create displays
        this.displays = new Displays(this);

        // Create the scene
        this.scene = new MyScene(this, (0 == rockCount));

        // Create items.
        // Create ship first so it is 1st, for collision detection purposes,  in the item list.
        this.createRocks(rockCount);
        this.createShip();
        this.createSaucers();

        // Now we have a ship. Switch to it's camera
        this.scene.setCamera(MyCamera.PILOT);

        // First call of animation loop.
        this.loop();
    }

    createShip() {
        this.ship = new Ship(5, 10, 20, 0, 0, 0, this);
    }

    shipDestroyed() {
        if (this.player.killed()) {
            this.displays.setMessage("Ship destroyed! ... restarting", 3000);

            this.clearRespawnArea();

            this.ship.respawn();
        } else {
            this.ship.destruct();
            this.displays.setMessage("Game Over! ... Final score = " + this.player.getScore() + " ... Refresh page to play again.", 0);
        }
    }

    getVersion() {
        return (VERSION);
    }

    getScene() {
        return (this.scene);
    }

    getPlayer() {
        return(this.player);
    }

    createSaucers() {
        if (this.testMode) {
            // New saucer
            new SaucerStatic(200, 100, -50, this, false);
            new SaucerWanderer(400, 100, -50, this, null, false);
            new SaucerShooter(300, 100, -50, this, null, true);
            new SaucerHunter(300, 200, -50, this, null, true);
            new SaucerRam(1000, 100, 200, this, null, true);
            this.motherSaucer = new SaucerMother(600, 100, -50, this, null, true);
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
            // new Rock(20, 900, 900, 0, 0, 0, 0, this);

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

        } else {
            // Create a bunch of random rocks
            for (let r = 0; r <= rockCount; r++) {
                let rx = (Math.random() * Universe.UNI_SIZE * 2) - Universe.UNI_SIZE;
                let ry = (Math.random() * Universe.UNI_SIZE * 2) - Universe.UNI_SIZE;
                let rz = (Math.random() * Universe.UNI_SIZE * 2) - Universe.UNI_SIZE;
                let vx = (Math.random() * MAX_ROCK_VELOCITY * 2) - MAX_ROCK_VELOCITY;
                let vy = (Math.random() * MAX_ROCK_VELOCITY * 2) - MAX_ROCK_VELOCITY;
                let vz = (Math.random() * MAX_ROCK_VELOCITY * 2) - MAX_ROCK_VELOCITY;
                let sz = Math.floor((Math.random() * MAX_ROCK_SIZE) + 10);

                new Rock(sz, rx, ry, rz, vx, vy, vz, this);
            }

            this.clearRespawnArea();
        }
    }

    clearRespawnArea() {
        Universe.clearBox(-RESPAWN_SIZE, -RESPAWN_SIZE, -RESPAWN_SIZE, RESPAWN_SIZE,  RESPAWN_SIZE,  RESPAWN_SIZE);
    }

    createRandomVector(max) {
        return (new THREE.Vector3(Math.random() * max * 2 - max, Math.random() * max * 2 - max, Math.random() * max * 2 - max));
    }

    createMotherSaucer(safe) {
        let loc = this.ship.location.clone();

        // Create it close so we can find it.
        if (safe) {
            let offset = 500;
            loc.x += offset;
            loc.y += offset / 2;
        } else {
            // Move it far away. Let wrap calculation take care if too big.
            loc.x += Math.random() * Universe.UNI_SIZE;
            loc.y += Math.random() * Universe.UNI_SIZE;
            loc.z += Math.random() * Universe.UNI_SIZE;

            // Move it to one edge of the universe.
            switch (Math.floor(Math.random()) * 3) {
                case 0:
                    loc.x = this.ship.location.x + Universe.UNI_SIZE;
                    break;

                case 1:
                    loc.y = this.ship.location.y + Universe.UNI_SIZE;
                    break;

                case 2:
                default:
                    loc.z = this.ship.location.z + Universe.UNI_SIZE;
                    break;
            }
        }

        Universe.handleWrap(loc);

        new SaucerMother(loc.x, loc.y, loc.z, this, null, safe);

        this.motherSaucerCount++;

        // Game gradually gets harder.
        this.maxSaucerCount++;
    }

    removeMotherSaucer() {
        // console.log("MS destoryed");
        this.motherSaucerCount--;
    }

    getShip() {
        return (this.ship);
    }

    addScore(score, that) {
        // Only score damage we caused.
        if (that.owner == this.ship) {
            this.player.addScore(score);
        }
    }

    addRockScore(size, that) {
        if (that.owner == this.getShip()) {
            this.addScore((MAX_ROCK_SIZE - size) / 10 + 1, that);
        }
    }

    togglePaused() {
        this.paused = !this.paused;
        this.displays.teminalEnable(this.paused);
    }

    animate(date) {
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

        // Update displays
        this.animate(date);

        // Re-request self
        window.requestAnimationFrame(this.loop);
    }
}

export default Game;