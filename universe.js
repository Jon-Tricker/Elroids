// Everything related to the simulated 'Universe'.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';
import { System, SystemSpec } from './GameItems/System/system.js';
import StarSystem from './GameItems/System/starSystem.js';
import Hyperspace from './GameItems/System/hyperspace.js';
import { MineralTypes } from './GameItems/minerals.js';
import PlayerShip from './Ships/playerShip.js';
import Wormhole from './GameItems/System/wormhole.js';
import JSONSet from './Utils/jsonSet.js';
import NonShipItem from './GameItems/nonShipItem.js';
import BugError from './GameErrors/bugError.js';

const SYSTEM_SPECS = [
    new SystemSpec("Sol", 1, 0, 2, "Mostly harmless."),
    new SystemSpec("Asteel", 2, 0, 1, "Industrial society"),
    new SystemSpec("Kessel", 3, 0, 2, "High tech society"),
    new SystemSpec("Endor", 0, 1, 1, "Magical society. Guess some trading house built them a station.")
];

class Universe {
    // Back reference to out parent.
    game;

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
    static originVector = new THREE.Vector3(0, 0, 0);

    constructor(game, uniSize, systemSize, maxRockCount) {
        this.game = game;
        this.uniSize = uniSize;
        this.systemSize = systemSize;
        this.maxRockCount = maxRockCount;
        this.actualAnimateRate = game.ANIMATE_RATE;
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
            nextItemId: NonShipItem.idCount
        }
    }

    static fromJSON(json, game) {
        // Restore Item count so any new item IDs don't clash with the saved ones.
        NonShipItem.idCount = json.nextItemId;

        let uni = new Universe(game, json.uniSize, json.systemSize, json.maxRockCount);

        uni.populate(json);

        if (undefined != json.ship.dockedWith) {
            let station = uni.getSystemByName(json.currentSystem).getItemById(json.ship.dockedWith);
            if (null != station) {
                uni.ship.dock(station);
            }
        }

        return (uni);
    }

    populate(json) {

        // Create hyperspacc
        this.hyperspace = new Hyperspace(this, this.systemSize);

        // Create initial systems
        this.createSystems(json);

        // Create wormholes.
        this.createWormholes(json);

        // Put ship into current system.
        this.createShip(json);

        // Now we have a ship to target can create saucers.
        this.createSaucers(json);

        // Add non player ships.
        this.createNPShips(json);

        // Make current system graphics active.
        this.system.setActive(true);
    }

    createSystems(json) {
        if (undefined === json) {
            let count = 0;
            for (let spec of SYSTEM_SPECS) {
                let uniLoc;
                count++;

                if (this.game.testMode) {
                    uniLoc = new THREE.Vector3(500 * count, 0, 0);
                } else {
                    // Locate system randomly in the universe
                    let minDist;
                    do {
                        uniLoc = this.game.createRandomIntegerVector(this.systemSize / 5);
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
                let system = new StarSystem(this, spec, this.systemSize, this.maxRockCount, uniLoc);
                this.systems.add(system);
            }
        } else {
            this.systems = new JSONSet();
            let systemIndex = 0;
            for (let jsonSystem of json.systems) {
                let system = StarSystem.fromJSON(jsonSystem, this);

                if (systemIndex == json.systemIndex) {
                    this.system = system;
                }
                systemIndex++;

                this.systems.add(system);
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

    createSaucers(json) {
        if (undefined === json) {
            for (let system of this.systems) {
                system.createSaucers();
            }
        } else {
            for (let jsonSystem of json.systems) {
                this.getSystemByName(jsonSystem.spec.name).createSaucers(jsonSystem);
            }
        }
    }

    createNPShips(json) {
        if (undefined === json) {
            for (let system of this.systems) {
                system.createNPShips();
            }
        } else {
            for (let jsonSystem of json.systems) {
                this.getSystemByName(jsonSystem.spec.name).createNPShips(jsonSystem);
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
                if (this.game.testMode) {
                    sysLoc = new THREE.Vector3(0, 500 * count, 0);
                } else {
                    // Locate wormhole randomly in the system
                    do {
                        sysLoc = this.game.createRandomIntegerVector(this.systemSize);
                    } while (sysLoc.length < (this.systemSize / 2));
                }
                this.wormholes.add(new Wormhole(system, sysLoc, system.uniLocation));
                count++;
            }
        } else {
            this.wormholes = new JSONSet();
            for (let jsonWormhole of json.wormholes) {
                let wormhole = Wormhole.fromJSON(jsonWormhole, this);
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
            this.nextAnimateTime = date + 1000 / this.game.getAnimateRate();

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

    // Checks and handles wrap round of a vector.
    handleWrap(vec) {
        let sz = this.systemSize;

        if (vec.x > sz) {
            vec.x -= 2 * sz;
        }
        if (vec.x < -sz) {
            vec.x += 2 * sz;
        }
        if (vec.y > sz) {
            vec.y -= 2 * sz;
        }
        if (vec.y < -sz) {
            vec.y += 2 * sz;
        }
        if (vec.z > sz) {
            vec.z -= 2 * sz;
        }
        if (vec.z < -sz) {
            vec.z += 2 * sz;
        }
    }

    // Create a ship.
    createShip(json) {
        let system = this.system;

        if (undefined === json) {
            if (this.game.testMode) {
                this.ship = new PlayerShip(system, 5, 10, 20, Universe.originVector);

                // Do some damage
                this.ship.hull.compSets.takeDamage(1);

                // Add another cargo bay
                for (let bay of this.game.componentsList.baySet) {
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
                for (let comp of this.game.componentsList.weaponSet) {
                    comp = comp.buy(this.ship, true);
                    comp.takeDamage(1);
                    break;
                }

                // Add a higher tech component.
                let first = true;
                for (let comp of this.game.componentsList.engineSet) {
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
                for (let good of this.game.goodsList) {
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
                this.ship = new PlayerShip(system, 5, 10, 20, new THREE.Vector3(-200, 100, 0));
            }
        } else {
            this.ship = PlayerShip.fromJSON(json.ship, system);
        }
    }

    // Get System by name.
    // null if not found.
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
}

export default Universe;