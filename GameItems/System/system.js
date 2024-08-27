// Base class for all 'systems' (areas that can be navigated.)
import SkyBox from "../../Scenery/skyBox.js"

// Box to clear out arround respawn site.
const RESPAWN_SIZE = 250;          // m

class System {
    // Back reference to out parent.
    universe;

    // Size of this system
    systemSize;

    name;

    // Distance units.
    units = "m"

    // Wormhole ends in the system.
    wormholeEnds = new Set();

    // All items in system.
    items = new Set();

    // Universal locaiton (in lightyears)
    uniLocation

    // Static elements
    skyBox;

    constructor(universe, name, systemSize, uniLocation, background) {
        this.name = name;
        this.systemSize = systemSize;
        this.universe = universe;
        this.uniLocation = uniLocation;

        // Create static elements.
        let skyBoxSize = universe.systemSize * 4;
        this.createSkyBox(skyBoxSize, background);
    }

    createSkyBox(size, background) {
        // Create populated.
        this.skyBox = new SkyBox(size, this, true, background);
    }

    getGame() {
        return (this.universe.game);
    }

    // Switch this system on/off
    setActive(state) {
        this.skyBox.setActive(state);
        for (let item of this.items) {
            item.setActive(state);
        }
    }

    addItem(item) {
        this.items.add(item);
    }

    removeItem(item) {
        this.items.delete(item);
    }

    addWormholeEnd(hole) {
        this.wormholeEnds.add(hole);
    }

    getWormholeEnds() {
        return (this.wormholeEnds);
    }

    animate(date, keyBoard) {
        let game = this.getGame();
        let scene = game.getScene();

        // Move sky box so we never get closer to it.
        if (!scene.camera.getIsFixedLocation()) {
            // Move with ship. 
            this.skyBox.position.set(game.getShip().position.x, game.getShip().position.y, game.getShip().position.z);
        } else {
            // Move with camera.
            this.skyBox.position.set(scene.camera.position.x, scene.camera.position.y, scene.camera.position.z);
        }

        for (let item of this.items) {
            item.animate(date, keyBoard);
        }
    }

    getGame() {
        return (this.universe.game);
    }
}

export default System;