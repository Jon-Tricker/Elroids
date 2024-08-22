// Stuff that's common to the entire game.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

import Universe from './universe.js';
import Rock from "./GameItems/rock.js";
import GameError from "./GameErrors/gameError.js"


import MyScene from './Scenery/myScene.js'
import MyCamera from './Scenery/myCamera.js'
import Displays from './Displays/displays.js'
import Keyboard from "./keyboard.js";
import PurchaseList from './Ship/Components/purchaseList.js';

import Player from './player.js';

const MAX_ROCK_VELOCITY = 25;       // m/s
const MAX_ROCK_SIZE = 40;           // m
const VERSION = "5.5";

const ANIMATE_RATE = 25;            // frames/second

// Load textures once.
const craterTexture = new THREE.TextureLoader().load("./Scenery/CraterTexture.gif");
craterTexture.wrapS = THREE.RepeatWrapping;
craterTexture.wrapT = THREE.RepeatWrapping;
craterTexture.repeat.set(4, 4);

class Game {

    // The one and only Universe object
    universe;

    // Objets related to game play.
    scene;
    displays;
    player;

    safe = false;

    rockStyle;

    soundOn = false;

    testMode = false;
    
    // Gradually increasing saucer number limit.
    maxSaucerCount = 5;

    paused = false;

    purchaseList;

    // Audio plumbing.
    static audioLoader = new THREE.AudioLoader();
    static listener;

    // Sounds buffer bank. Sounds written in once they are loaded.
    static sounds = new Map([
        ["pew", null],
        ["explosion", null],
        ["clang", null],
        ["coin", null],
        ["click", null],
        ["anvil", null],
        ["roar", null],
        ["poweron", null],
        ["poweroff", null],
        ["scream", null],
        ["thud", null],
        ["saw", null]
    ]);

    constructor(uniSize, systemSize, maxRockCount, rockStyle, safe, soundOn) {

        this.safe = safe;
        this.player = new Player();

        if ((soundOn != null) && (soundOn.toLowerCase() == "true")) {
            this.soundOn = true;
        }

        if (0 == maxRockCount) {
            this.testMode = true;

            // Give us some cash
            this.player.addCredits(12345);
        }

        Rock.setRockStyle(rockStyle);

        // Create shopping list.
        this.purchaseList = new PurchaseList(this);     

        // Create universe
        this.universe = new Universe(this, uniSize, systemSize, maxRockCount);  

        // Create the scene
        this.scene = new MyScene(this, (0 == maxRockCount));

        // Now there is something to display it popuate the universe,
        this.universe.populate();

        // Create displays
        this.displays = new Displays(this);
        this.displays.resize();

        if (this.testMode) {
            // Doc ship to first station.
            for (let station of this.universe.system.stations ) {
                // this.getShip().dock(station);
                break;
            }
        }

        // Now we have a ship. Switch to it's camera
        this.scene.setCamera(MyCamera.PILOT);

        // First call of animation loop.
        this.loop();
    }

    static getCraterTexture() {
        return (craterTexture);
    }

    getSounds() {
        return (Game.sounds);
    }

    getAnimateRate() {
        // Return the achieved frame rate.
        return (ANIMATE_RATE);
    }

    setListener(listener) {
        Universe.listener = listener;
    }

    loadSoundBuffers() {
        for (let [key, value] of Game.sounds) {
            let path = "./Sounds/" + key + ".ogg";
            Game.audioLoader.load(path, function (buffer) {
                // Callback after loading.
                Game.sounds.set(key, buffer);
            });
        }
    }

    getListener() {
        return (Universe.listener);
    }

    getUniverse() {
        return (this.universe);
    }

    getMaxRockVelocity() {
        return (MAX_ROCK_VELOCITY);
    }

    getMaxRockSize() {
        return (MAX_ROCK_SIZE);
    }


    shipDestroyed() {
        if (this.player.killed()) {
            this.displays.addMessage("Ship destroyed! ... restarting", 3000);

            this.clearRespawnArea();

            this.getShip().respawn();
        } else {
            this.getShip().destruct();
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

    createRandomVector(max) {
        return (new THREE.Vector3(Math.random() * max * 2 - max, Math.random() * max * 2 - max, Math.random() * max * 2 - max));
    }


    // Get a random location far away from ship. 
    //Let wrap calculation take care if too big.
    getFarAway(location) {
        let loc = location.clone();

        let delta = this.createRandomVector(this.universe.systemSize);

        // Move it to one edge of the universe.
        let sz = this.universe.systemSize;
        switch (Math.floor(Math.random()) * 3) {
            case 0:
                delta.x += sz;
                break;

            case 1:
                delta.y += sz;
                break;

            case 2:
            default:
                delta.z += sz;
                break;
        }

        loc.add(delta);

        this.universe.handleWrap(loc);

        return (loc);
    }

    getShip() {
        return (this.universe.ship);
    }

    togglePaused() {
        this.paused = !this.paused;
        if (null == this.getShip().dockedWith) {
            this.displays.terminalEnable(this.paused);
        }
    }

    getSystem() {
        return(this.universe.system);
    }

    animate(date) {
        if (Keyboard.getClearState("P") || Keyboard.getClearState("p")) {
            this.togglePaused();
        }

        if (!this.paused) {
            
            this.universe.animate(date, Keyboard);
            this.scene.animate();
        }
        this.displays.animate(this.universe.getTime(), Keyboard);
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