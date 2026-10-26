// Everything related to the simulated 'Universe'.

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Game from '../Game/game.js';
import { System, SystemSpec } from './System/system.js';
import StarSystem from './System/starSystem.js';
import Hyperspace from './System/hyperspace.js';
import { MineralTypes } from './minerals.js';
import PlayerShip from '../Ships/playerShip.js';
import Wormhole from './System/wormhole.js';
import JSONSet from '../Game/Utils/jsonSet.js';
import BugError from '../Game/bugError.js';
import Location from '../Game/Utils/location.js';
import ItemPers from './itemPers.js';

const SYSTEM_SPECS = [
    new SystemSpec(undefined, "Sol", 6, 2, 5, "Mostly harmless."),
    new SystemSpec(undefined, "Asteel", 6, 1, 4, "Industrial, capitalist society."),
    new SystemSpec(undefined, "Kessel", 7, 1, 6, "High tech society."),
    new SystemSpec(undefined, "Endor", 2, 4, 2, "Low tech, magical society."),
    new SystemSpec(undefined, "Coruscant", 7, 2, 7, "High tech, authoritarian society."),
    new SystemSpec(undefined, "Oz", 3, 4, 7, "Magical, authoritarian society.")
];

class Universe {
    // The, one and only, ship.
    ship;

    // Univrese time. If animation stpped can be paused.
    universeTime = 0;

    // Size of universe before wrap round. Total width will be twice this.
    uniSize;                        // Some large unit (light years?)

    // Size of default system  before wrap round. Total width will be twice this.
    systemSize;                     // m

    nextAnimateTime = Date.now();
    lastAnimateTime = Date.now();
    actualAnimateRate = 0;

    // List of systems.
    systems = new JSONSet();

    // Hyperspace system.
    hyperspace;

    // Current system
    system;
    systemCount = 0;

    maxRockCount;

    // All wormhole
    wormholes = new JSONSet();

    static CBRT_THREE = Math.cbrt(3);

    constructor(json, uniSize, systemSize, maxRockCount) {
        if (undefined != json) {
            // Restore Item count so any new item IDs don't clash with the saved ones.
            ItemPers.idCount = json.nextItemId;

            uniSize = json.uniSize;
            systemSize = json.systemSize;
            maxRockCount = json.maxRockCount;
        }

        this.uniSize = uniSize;
        this.systemSize = systemSize;
        this.maxRockCount = maxRockCount;
        this.actualAnimateRate = Game.getGame().ANIMATE_RATE;
    }

    // Destruct as much as possible. Hopefully garbage clearance will kick in.
    destruct() {
        for (let system of this.systems) {
            system.destruct();
        }

        this.wormholes = undefined;
        this.hyperspace = undefined;
    }

    toJSON() {
        return {
            uniSize: this.uniSize,
            systemSize: this.systemSize,
            maxRockCount: this.maxRockCount,
            currentSystem: this.system.getName(),
            systems: this.systems.toJSON(),
            wormholes: this.wormholes.toJSON(),
            ship: this.ship.toJSON(),
            nextItemId: ItemPers.idCount
        }
    }

    populate(json) {

        // Create hyperspacc
        this.hyperspace = new Hyperspace(this.systemSize);

        // Create initial systems
        this.createSystems(json);

        // Create wormholes.
        this.createWormholes(json);

        // Put ship into current system.
        this.createShip(json);
    }

    createSystems(json) {
        if (undefined === json) {
            let count = 0;
            for (let spec of SYSTEM_SPECS) {
                let uniLoc;
                count++;

                if (Game.getGame().testMode) {
                    uniLoc = new Location(undefined, 500 * count, 0, 0, this.hyperspace);
                } else {
                    // Locate system randomly in the universe
                    let minDist;
                    do {
                        uniLoc = Location.createRandomInSystem(this.hyperspace, this.systemSize / 5, true);
                        minDist = this.systemSize;
                        for (let sys of this.systems) {
                            let relLoc = sys.uniLoc;
                            relLoc -= uniLoc;
                            if (relLoc.length < minDist) {
                                minDist = relLoc.length;
                            }
                        }
                    } while (minDist < (this.systemSize / 10));
                }
                let system = new StarSystem(json, spec, this.systemSize, this.maxRockCount, uniLoc);
                this.systems.add(system);

                // Now it is added can populate.
                system.populate(json);
            }
        } else {
            this.systems = new JSONSet();
            let systemIndex = 0;
            for (let jsonSystem of json.systems) {
                let system = new StarSystem(jsonSystem);

                if (systemIndex == json.systemIndex) {
                    this.system = system;
                }
                systemIndex++;

                this.systems.add(system);

                // Now it is added can populate.
                system.populate(jsonSystem);
            }
        }

        // Scan through systems and setup other variables.
        if (undefined != json) {
            this.system = this.getSystemByName(json.currentSystem)
        } else {
            let count = 0;;
            for (let system of this.systems) {

                // First system is active.
                if (0 == count++) {
                    this.system = system;
                }
            }
        }
    }

    createWormholes(json) {
        if (undefined === json) {  // Scan through systems and setup other variables.
            let count = 1;
            for (let system of this.systems) {
                // Create wormhole between this system and hyperspace.
                // Locate system end away from origin in system.
                let sysLoc;
                if (Game.getGame().testMode) {
                    sysLoc = new Location(undefined, 0, 500 * count, 0, system);
                } else {
                    // Locate wormhole randomly in the system
                    do {
                        sysLoc = Location.createRandomInSystem(system, true);
                    } while (sysLoc.length < (this.systemSize / 2));
                }
                this.wormholes.add(new Wormhole(json, sysLoc, system.uniLocation));
                count++;
            }
        } else {
            this.wormholes = new JSONSet();
            for (let jsonWormhole of json.wormholes) {
                let wormhole = new Wormhole(jsonWormhole);
                this.wormholes.add(wormhole);
            }
        }
    }

    // Animate all objects.
    animate(date, keyBoard) {
        if (date >= this.nextAnimateTime) {
            if (undefined != this.actualAnimateRate) {
                this.universeTime += 1000 / this.actualAnimateRate;
            }
            this.nextAnimateTime = date + 1000 / Game.getGame().getAnimateRate();

            // Only animate the active system.
            this.system.animate(this.universeTime, keyBoard);

            this.actualAnimateRate = 1000 / (date - this.lastAnimateTime);
            this.lastAnimateTime = date;
        }
    }

    getActualAnimateRate() {
        return (this.actualAnimateRate)
    }

    getTime() {
        return (this.universeTime);
    }

    getMaxRockCount() {
        return (this.maxRockCount);
    }

    // Create a ship.
    createShip(json) {
        let system = this.system;
        let game = Game.getGame();

        if (undefined === json) {
            if (Game.getGame().testMode) {
                this.ship = new PlayerShip(undefined, 5, 10, 20, new Location(undefined, 0, 0, 0, system));

                // Do some damage
                this.ship.compSets.takeDamage(1);

                // Add another cargo bay
                for (let bay of game.componentsList.baySet) {
                    bay = bay.mount(this.ship, true);
                    bay.takeDamage(1);
                    break;
                }

                // Add some minerals to the cargo.
                for (let i = 1; i < 3; i++) {
                    let type = 1 + Math.floor(Math.random() * (MineralTypes.length - 1));
                    this.ship.loadMineral(MineralTypes[type], i);
                }

                // Add some components to cargo.
                // Ugg ... just get first element.
                for (let comp of game.componentsList.weaponSet) {
                    comp = comp.buy(this.ship, true);
                    comp.takeDamage(1);
                    break;
                }

                // Add a higher tech component.
                let first = true;
                for (let comp of game.componentsList.engineSet) {
                    if (first) {
                        first = false;
                    } else {
                        comp = comp.buy(this.ship, true);
                        comp.takeDamage(1);
                        break;
                    }
                }

                // Add some goods. 
                let count = 0;
                for (let good of game.goodsList) {
                    switch (count) {
                        case 3:
                            good.buy(this.ship, 1, true);
                        // Fall thru.

                        case 0:
                            good.buy(this.ship, 1, true);

                        default:
                            break;
                    }
                    count++;
                }
            } else {
                this.ship = new PlayerShip(undefined, 5, 10, 20, new Location(undefined, -200, 100, 0, system));
            }
        } else {
            this.ship = new PlayerShip(json.ship);
        }
    }

    // Get System by name.
    getSystemByName(name) {
        if (this.hyperspace.getName() == name) {
            return (this.hyperspace);
        }

        for (let system of this.systems) {
            if (undefined != system.getName()) {
                if (system.getName() == name) {
                    return (system);
                }
            }
        }
        throw (new BugError("Cannot find system named " + name + "."))
    }

    // Remove non fixed labels.
    removeLabels() {
        for (let system of this.systems) {
            system.removeLabels();
        }
    }
}

export default Universe;