// Base class for all 'systems' (areas that can be navigated.)

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

    constructor(universe, name, systemSize, uniLocation) {
        this.name = name;
        this.systemSize = systemSize;
        this.universe = universe;
        this.uniLocation = uniLocation;
    }

    getGame() {
        return (this.universe.game);
    }

    // Switch this system on/off
    setActive(state) {
        let scene = this.getGame().getScene();
        if (state) {
            // Add all items to the scene.
            for (let item of this.items) {
                scene.add(item);
            }
        } else {
            // Remove all items from the scene.
            for (let item of this.items) {
                // Remove item
                scene.remove(item);
            }
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
        for (let item of this.items) {
            item.animate(date, keyBoard);
        }
    }

    getGame() {
        return (this.universe.game);
    }
}

export default System;