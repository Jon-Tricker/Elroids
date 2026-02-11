// Stuff that's common to the entire game.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';

import Universe from '../GameItems/universe.js';
import Rock from "../GameItems/rock.js";
import GameError from "./gameError.js"
import { ComponentsList } from '../Trade/purchaseLists.js';
import { GoodsList } from '../Trade/goodsTypes.js';
import MyScene from './Scenery/myScene.js';
import MyCamera from './Scenery/myCamera.js';
import Keyboard from "./Utils/keyboard.js";
import Player from './player.js';
import Displays from '../Displays/displays.js';

const MAX_ROCK_VELOCITY = 25;       // m/s
const MAX_ROCK_SIZE = 40;           // m
const VERSION = "9.6";

const ANIMATE_RATE = 25;            // frames/second

// Load textures once.
const craterTexture = new THREE.TextureLoader().load("./Game/Scenery/CraterTexture.gif");
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
    startDocked = false;

    // Gradually increasing saucer number limit.
    maxSaucerCount = 5;

    paused = false;

    // Shopping catalogs.
    componentsList;
    goodsList;

    // Audio plumbing.
    static audioLoader = new THREE.AudioLoader();
    static listener;


    // Sounds buffer bank. Sounds written in once they are loaded.
    static sounds = new Map([
        ["pew", null],
        ["explosion", null],
        ["clang", null],
        ["coin", null],
        ["till", null],
        ["click", null],
        ["anvil", null],
        ["roar", null],
        ["poweron", null],
        ["poweroff", null],
        ["scream", null],
        ["thud", null],
        ["saw", null],
        ["police", null]
    ]);

    constructor(uniSize, systemSize, maxRockCount, rockStyle, safe, soundOn, startDocked) {

        this.setSafe(safe);
        this.player = new Player();

        if ((soundOn != null) && (soundOn.toLowerCase() == "true")) {
            this.soundOn = true;
        }     
        
        if ((startDocked != null) && (startDocked.toLowerCase() == "true")) {
            this.startDocked = true;
        }

        if (0 == maxRockCount) {
            this.testMode = true;

            // Give us some cash
            this.player.addCredits(12345);
            //this.player.addCredits(121);
        }

        Rock.setRockStyle(rockStyle);

        // Create shopping list.
        this.componentsList = new ComponentsList(this);
        this.goodsList = new GoodsList(this);

        // Create universe
        this.universe = new Universe(this, uniSize, systemSize, maxRockCount);

        // Create the scene
        this.scene = new MyScene(this, (0 == maxRockCount));

        // Now there is something to display it popuate the universe,
        this.universe.populate();

        // Create displays
        this.displays = new Displays(this);
        this.displays.resize();

        // Now we have a ship. Switch to it's camera
        this.scene.setCamera(MyCamera.PILOT);

        if (this.startDocked) {
            // Doc ship to first station.
            for (let station of this.universe.system.stations) {
                this.getShip().dock(station);
                break;
            }
        }
        

        // First call of animation loop.
        this.loop();
    }

    static getCraterTexture() {
        return (craterTexture);
    }

    save() {
        // Make JSON save image.
        let json = this.toJSON();
        let fileContent = JSON.stringify(json);

        // Make a Blob.
        let blob = new Blob([fileContent], { type: 'application/json' });

        // Create a download element.
        let doc = document.createElement('a');
        doc.download = 'ElroidSav.txt';
        doc.href = window.URL.createObjectURL(blob);

        // Invoke download to local file space.
        doc.click();

        return;
    }

    toJSON() {
        return {
            version: VERSION,
            cameraType: this.scene.camera.type,
            paused: this.paused,
            testMode: this.testMode,
            soundOn: this.soundOn,
            maxSaucerCount: this.maxSaucerCount,
            safe: this.safe,
            player: this.player.toJSON(),
            universe: this.universe.toJSON()
        }
    }

    load() {
        // Create a file selector.
        let input = document.createElement('input');
        input.type = 'file';

        // Create a listener. Triggered after file loads.
        input.onchange = e => {
            let file = e.target.files[0];

            // setting up the reader
            let reader = new FileReader();
            reader.readAsText(file, 'UTF-8');

            // Cretae a listener. Triggered once file is loaded.
            reader.onload = readerEvent => {
                let fileContent = readerEvent.target.result;
                let json = JSON.parse(fileContent);
                this.fromJSON(json)

                if (this.paused) {
                    // Animate one frame to updatde graphics.
                    this.togglePaused();
                    this.animate(Date.now());
                    this.togglePaused();
                }
            }
        }

        // Invoke file selector.
        input.click();
    }

    // Since we are the top level object, uniquely, this is not a static.
    fromJSON(json) {
        // Deactivate old sustem.
        this.universe.system.setActive(false);

        this.testMode = json.testMode;
        this.soundOn = json.soundOn;
        this.maxSaucerCount = json.maxSaucerCount;
        this.safe = json.safe;

        this.player = Player.fromJSON(json.player);
        this.universe = Universe.fromJSON(json.universe, this);

        // Activate new system.
        this.universe.system.setActive(true);

        if (this.paused != json.paused) {
            this.togglePaused();
        }

        // Refresh displays.
        this.displays = new Displays(this);
        this.displays.resize();

        // We saved from a menu. So koad with terminal open/
        this.displays.terminalEnable(true);

        this.scene.setCamera(json.cameraType);

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

    createRandomVector(max, integer) {
        let x = Math.random() * max * 2 - max;
        let y = Math.random() * max * 2 - max;
        let z = Math.random() * max * 2 - max;

        if ((undefined != integer) && integer) {
            x = Math.floor(x);
            y = Math.floor(y);
            z = Math.floor(z);
        }

        return (new THREE.Vector3(x, y, z));
    }

    createRandomIntegerVector(max) {
        return (this.createRandomVector(max, true));
    }

    // Get a random location far away from ship. 
    //Let wrap calculation take care if too big.
    getFarAway(location) {
        let sz = location.system.systemSize;
        let loc = location.clone();

        let delta = this.createRandomVector(sz);

        // Move it to one edge of the universe.
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
        return (this.universe.system);
    }

    isSafe() {
        return(this.safe);
    }

    setSafe(safe) {
        this.safe = safe;
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