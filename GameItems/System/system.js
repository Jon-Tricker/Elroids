// Base class for all 'systems' (areas that can be navigated.)
import SkyBox from "../../Scenery/skyBox.js"
import { MineralTypes } from "../minerals.js";
import BugError from "../../GameErrors/bugError.js";

// Specification of a star system.
class SystemSpec {
    name;
    techLevel;
    magicLevel;
    lawLevel;
    mineralAbundance = new Map();   // %

    constructor(name, techLevel, magicLevel, lawLevel, description, abundancies) {
        this.name = name;
        this.techLevel = techLevel;
        this.magicLevel = magicLevel;
        this.lawLevel = lawLevel;
        this.description = description;
        this.setupAbundancies(abundancies);
    }

    setupAbundancies(abundancies) {
        for (let type = 0; type < MineralTypes.length; type++) {
            let mineralType = MineralTypes[type];
            let abundance;
            if (undefined === abundancies) {
                // Work out mineral abundance for this system.
                abundance = mineralType.abundance * (0.5 + Math.random());
                if (mineralType.getIsMagic()) {
                    abundance *= this.magicLevel;
                }
            } else {
                // Use passed.
                abundance = abundancies[type];
            }
            this.mineralAbundance.set(mineralType, abundance);
        }
        this.normalizeAbundancies();
    }

    toJSON() {
        // Store in same order as MineralTypes. So don't need key.
        let abundancies = [];
        for (let [key, value] of this.mineralAbundance) {
            abundancies.push(Math.round(value * 1000) / 1000);
        }

        return {
            name: this.name,
            techLevel: this.techLevel,
            magicLevel: this.magicLevel,
            lawLevel: this.lawLevel,
            description: this.description,
            abundancies: abundancies
        }
    }

    static fromJSON(json) {
        return (new SystemSpec(json.name, json.techLevel, json.magicLevel, json.lawLevel, json.description, json.abundancies));
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

    constructor(universe, spec, systemSize, uniLocation, background, json) {
        this.spec = spec;
        this.systemSize = systemSize;
        this.universe = universe;
        this.uniLocation = uniLocation;

        this.createSkyBox(background, json)
    }
    
    createSkyBox(background, json) {
        if (undefined === json) {
            // Create static elements.
            let skyBoxSize = this.universe.systemSize * 4;
            this.skyBox = new SkyBox(skyBoxSize, this, true, background);
        } else {
            this.skyBox = SkyBox.fromJSON(json.skyBox, this);
        }
    }

    toJSON() {
        let json = {
            spec: this.spec.toJSON(),
            systemSize: this.systemSize,
            uniLocation: this.uniLocation,
            background: this.background,
            skyBox: this.skyBox.toJSON()
        }

        return(json);
    }

    static fromJSON(json, universe) {
        return (new System(universe, new SystemSpec(json.SystemSpec), json.systemSize, json.uniLocation, json.background, json.skyBox));
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

    // Get item by id.
    // null if not found.
    getItemById(id) {
        for (let item of this.items) {
            if (undefined != item.getId()) {
                if (id == item.getId()) {
                    return (item);
                }
            }
        }
        throw(new BugError("Cannot find item ID " + id + " in " + this.name + " system."))
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
}

export { System, SystemSpec };