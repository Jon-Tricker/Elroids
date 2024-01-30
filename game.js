// Game mechanics

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

import Ship from "./GameItems/ship.js";
import Rock from "./GameItems/rock.js";

import SaucerWanderer from "./GameItems/Saucers/saucerMother.js";
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

const MAX_ROCK_VELOCITY = 0.5;
const MAX_ROCK_SIZE = 8;
const VERSION = "0.20";

class Game {
    // Probably the wrong place for this.
    ship;
    scene;
    displays;

    safe = false;

    lives = 3;
    score = 0;
    rockStyle;

    testMode = false;

    saucerCount = 0;
    motherSaucerCount = 0;

    // Gradually increasing saucer number limit.
    maxSaucerCount = 5;

    paused = false;

    constructor(rockCount, rockStyle, safe) {

        this.safe = safe;

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
        this.createShip();
        this.createRocks(rockCount);

        // Now we have a ship. Switch to it's camera
        this.scene.setCamera(MyCamera.PILOT);

        // First call of animation loop.
        this.loop();
    }

    createShip() {
        this.ship = new Ship(0.5, 1, 2, 0, 0, 0, this);
    }

    shipDestroyed() {
        this.lives--;
        if (0 < this.lives) {
            this.displays.setMessage("Ship destroyed! ... restarting", 3000);

            // Clear our respawn area.
            Universe.clearBox(-50, -50, -50, 50, 50, 50);

            this.ship.respawn();
        } else {
            this.ship.destruct();
            this.displays.setMessage("Game Over! ... Final score=" + this.score + " ... Refresh page to play again.", 0);
        }
    }

    getVersion() {
        return (VERSION);
    }

    getScene() {
        return (this.scene);
    }

    createRocks(rockCount, rockStyle) {
        if (this.testMode) {
            // Create a few test rocks at set locations

            // Horizontal colliders
            /*
            new Rock(2, 3, 5, 0, 0, 0, 0, this);
            new Rock(1, -3, 5, 0, 0.1, 0, 0, this);
            */

            // Big target
            // new Rock(2, 7, 0, 0, 0.05, 0, 0, this);

            // Small target
            // new Rock(8, -10, 0, 0, 0, 0, 0, this);

            // Row of rocks

            for (let i = -Universe.UNI_SIZE; i < Universe.UNI_SIZE; i += 21) {
                let sz = Math.abs(i % MAX_ROCK_SIZE);
                if (sz != 0) {
                    new Rock(sz, i, -10, 0, 0, 0, 0, this);
                }
            }


            // Diagonal row of rocks.
            for (let i = 0; i < Universe.UNI_SIZE; i += 21) {
                let sz = i % MAX_ROCK_SIZE;
                new Rock(sz, -20 + i, i, i, 0, 0, 0, this);
            }

            // New saucer
            new SaucerStatic(20, 10, -5, this, false);
            new SaucerWanderer(40, 10, -5, this, null, false);
            new SaucerShooter(30, 10, -5, this, null, true);
            // new SaucerHunter(30, 10, -5, this, null, true);
            new SaucerRam(100, 10, 20, this, null, true);
            this.motherSaucer = new SaucerMother(60, 10, -5, this, null, true);
        } else {
            // Create a bunch of random rocks
            for (let r = 0; r <= rockCount; r++) {
                let rx = (Math.random() * Universe.UNI_SIZE * 2) - Universe.UNI_SIZE;
                let ry = (Math.random() * Universe.UNI_SIZE * 2) - Universe.UNI_SIZE;
                let rz = (Math.random() * Universe.UNI_SIZE * 2) - Universe.UNI_SIZE;
                let vx = (Math.random() * MAX_ROCK_VELOCITY * 2) - MAX_ROCK_VELOCITY;
                let vy = (Math.random() * MAX_ROCK_VELOCITY * 2) - MAX_ROCK_VELOCITY;
                let vz = (Math.random() * MAX_ROCK_VELOCITY * 2) - MAX_ROCK_VELOCITY;
                let sz = Math.floor((Math.random() * MAX_ROCK_SIZE) + 1);

                // Move towards the universe boundaries.
                switch (Math.floor(Math.random() * 6)) {
                    case (0):
                        rx = (Universe.UNI_SIZE + Math.random() * Universe.UNI_SIZE) / 2;
                        break;
                    case (1):
                        rx = -(Universe.UNI_SIZE + Math.random() * Universe.UNI_SIZE) / 2;
                        break;
                    case (2):
                        ry = (Universe.UNI_SIZE + Math.random() * Universe.UNI_SIZE) / 2;
                        break;
                    case (3):
                        ry = -(Universe.UNI_SIZE + Math.random() * Universe.UNI_SIZE) / 2;
                        break;
                    case (4):
                        rz = (Universe.UNI_SIZE + Math.random() * Universe.UNI_SIZE) / 2;
                        break;
                    default:
                        rz = -(Universe.UNI_SIZE + Math.random() * Universe.UNI_SIZE) / 2;
                        break;
                }

                new Rock(sz, rx, ry, rz, vx, vy, vz, this);
            }

            // First mother ship always in safe mode.
            this.createMotherSaucer(true);
        }
    }

    createRandomVector(max) {
        return (new THREE.Vector3(Math.random() * max * 2 - max, Math.random() * max * 2 - max, Math.random() * max * 2 - max));
    }

    createMotherSaucer(safe) {
        let loc = this.ship.location.clone();

        // Create it close so we can find it.
        if (safe) {
            let offset = 100;
            loc.x += offset;
            loc.y += offset;
        } else {
            // Move it far away. Let wrap calculation take care if too big.
            loc.x += Math.random() * Universe.UNI_SIZE;
            loc.y += Math.random() * Universe.UNI_SIZE;
            loc.z += Math.random() * Universe.UNI_SIZE;

            // Move it to one edge of the universe.
            switch (Math.floor(Math.random()) * 3) {
                case 0:
                    loc.x = this.ship.location.x +  Universe.UNI_SIZE;
                    break;

                case 1:
                    loc.y = this.ship.location.y +  Universe.UNI_SIZE;
                    break;

                case 2:
                default:
                    loc.z = this.ship.location.z +  Universe.UNI_SIZE;
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
            this.score += score;
        }
    }

    addRockScore(size, that) {
        if (that.owner == this.getShip()) {
            this.addScore(MAX_ROCK_SIZE - size + 1, that);
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