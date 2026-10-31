// Base class for all 'systems' (areas that can be navigated.)
// 
// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Game from "../../Game/game.js";
import SkyBox from "../../Game/Scenery/skyBox.js";
import { MineralTypes } from "../minerals.js";
import JSONSet from "../../Game/Utils/jsonSet.js";
import BugError from "../../Game/bugError.js";
import GoodsCrate from "../../Trade/goodsCrate.js";
import Mineral from "../mineral.js";
import WormholeEnd from "./wormholeEnd.js";
import Station from "./station.js";

// Specification of a star system.
class SystemSpec {
    name;
    techLevel;
    magicLevel;
    lawLevel;
    mineralAbundance = new Map();   // %

    constructor(json, name, techLevel, magicLevel, lawLevel, description, abundancies) {
        if (undefined != json) {
            name = json.name;
            techLevel = json.techLevel;
            magicLevel = json.magicLevel;
            lawLevel = json.lawLevel;
            description = json.description;
            abundancies = json.abundancies;
        }

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
    // Size of this system
    systemSize;

    spec;

    // Distance units.
    units = "m"

    // Wormhole ends in the system.
    wormholeEnds = new JSONSet();

    // All items in system.
    items = new Set();

    // Universal locaiton (in lightyears)
    uniLocation

    // Static elements
    skyBox;

    constructor(json, spec, systemSize, uniLocation, background) {
        if (undefined != json) {
            spec = new SystemSpec(json.spec);
            systemSize = json.systemSize;
            uniLocation = json.uniLocation;
            background = json.background;
        }

        this.spec = spec;
        this.systemSize = systemSize;
        this.uniLocation = uniLocation;

        this.createSkyBox(background, json)
    }

    destruct() {
        for (let item of this.items) {
            item.destruct(false);
        }

        this.wormholeEnds = undefined;
        this.SkyBox = undefined;
    }

    createSkyBox(background, json) {
        if (undefined === json) {
            // Create static elements.
            let skyBoxSize = this.systemSize * 4;
            this.skyBox = new SkyBox(undefined, this, skyBoxSize, true, background);
        } else {
            this.skyBox = new SkyBox(json.skyBox, this);
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

        return (json);
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

    getSize() {
        return (this.systemSize);
    }

    // Switch this system on/off
    setActive(state) {
        this.skyBox.setActive(state);
        for (let item of this.items) {
            item.setActive(state);
        }

        // Now everything is active do any necessary docking. 
        if (state) {
            for (let item of this.items) {
                if (undefined != item.getDockedWith()) {
                    item.dock(item.getDockedWith());
                }
            }
        }
    }

    addItem(item) {
        this.items.add(item);

        if (item instanceof WormholeEnd) {
            this.wormholeEnds.add(item);
        }  
    }

    removeItem(item) {
        this.items.delete(item);    
        
        if (item instanceof WormholeEnd) {
            this.wormholeEnds.delete(item);
        }  
    }

    // Get item by id.
    getItemById(id) {
        for (let item of this.items) {
            if (undefined != item.getId()) {
                if (id == item.getId()) {
                    return (item);
                }
            }
        }
        throw (new BugError("Cannot find item ID " + id + " in " + this.name + " system."))
    }

    addWormholeEnd(hole) {
        this.wormholeEnds.add(hole);
    }

    getWormholeEnds() {
        return (this.wormholeEnds);
    }

    // By default no police.
    recalcPoliceHostility() {
    }

    animate(date, keyBoard) {
        let game = Game.getGame();
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

            // IF not still the current system give up.
            if (Game.getGame().getUniverse().system != this) {
                return;
            }
        }
    }

    // Gets this most valuable floating item of a given class.
    // Class 'undefined' is a wild card.
    // If a location is passes weights the result for closeness. 
    // Returns undefined if nothing available.
    getValuable(type, location) {
        let maxValTarget;
        let maxVal = 0;

        if (undefined == type) {
            let minTarget = this.getValuable(Mineral, location);
            let crateTarget = this.getValuable(GoodsCrate, location);
            if (undefined != minTarget) {
                if ((undefined == crateTarget) || (minTarget.getRelativeValue(location) > crateTarget.getRelativeValue(location))) {
                    return (minTarget);
                }
            }
            return (crateTarget);
        }

        for (let that of this.items) {
            if (that instanceof type) {

                let value = that.getValue();
                if (undefined != location) {
                    value = that.getRelativeValue(location)
                }

                if ((undefined == maxValTarget) || (value > maxVal)) {
                    maxValTarget = that;
                    maxVal = value;
                }
            }
        }

        return (maxValTarget);
    }

    // Get closest item of a given class.
    getClosest(type, loc) {
        let dist;
        let closest;
        for (let that of this.items) {
            if (that instanceof type) {
                let thatDist = that.location.distanceTo(loc)
                if ((undefined == closest) || (dist > thatDist)) {
                    closest = that;
                    dist = thatDist;
                }
            }
        }

        return (closest);
    }

    // Remove non fixed labels.
    removeLabels() {
        for (let item of this.items) {
            item.removeLabel();
        }
    }
}

export { System, SystemSpec };