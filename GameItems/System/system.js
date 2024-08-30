// Base class for all 'systems' (areas that can be navigated.)
import SkyBox from "../../Scenery/skyBox.js"
import { MineralTypes } from "../minerals.js";

// Specification of a star system.
class SystemSpec {
    name;
    techLevel;
    magicLevel;
    lawLevel;
    mineralAbundance = new Map();   // %

    constructor(name, techLevel, magicLevel, lawLevel, description) {
        this.name = name;
        this.techLevel = techLevel;
        this.magicLevel = magicLevel;
        this.lawLevel = lawLevel;
        this.description = description;

        // Work out mineral abundancies for this system.
        for (let type = 0; type < MineralTypes.length; type++) {
            // ToDo : Following to vary dependant on system tech and magic levels.
            let mineralType = MineralTypes[type];
            let abundance = mineralType.abundance * (0.5 + Math.random());
            if (mineralType.getIsMagic()) {
                abundance *= magicLevel;
            }
            this.mineralAbundance.set(mineralType, abundance);
        }
        this.normalizeAbundancies();
    }

    normalizeAbundancies() {
        let total = 0;
        for (let [key, value] of this.mineralAbundance) {
            total += value;
        }

        for (let [key, value] of this.mineralAbundance) {
            this.mineralAbundance.set(key, value / total);
        }
    }

    getMineralAbundance(mineral) {
        return (this.mineralAbundance.get(mineral));
    }

    getMineralValue(mineral) {
        let value = mineral.value;

        // Modify for system. Inverse of relative abundance in this system.
        let abundance = this.mineralAbundance.get(mineral);
        if (0 == abundance) {
            // Not infinite value
            abundance = 0.01;
        }
        value *= mineral.abundance / abundance;

        return (value);
    }
}

class System {
    // Back reference to out parent.
    universe;

    // Size of this system
    systemSize;

    spec;

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

    constructor(universe, spec, systemSize, uniLocation, background) {
        this.spec = spec;
        this.systemSize = systemSize;
        this.universe = universe;
        this.uniLocation = uniLocation;

        // Create static elements.
        let skyBoxSize = universe.systemSize * 4;
        this.createSkyBox(skyBoxSize, background);
    }

    getName() {
        return (this.spec.name);
    }

    getTechLevel() {
        return (this.spec.techLevel);
    }

    getMagicLevel() {
        return (this.spec.magicLevel);
    }

    getLawLevel() {
        return (this.spec.lawLevel);
    }

    getDescription() {
        return (this.spec.description);
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

export { System, SystemSpec };