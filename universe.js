// Everything related to the simulated 'Universe'.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';
import System from './GameItems/System/system.js';
import StarSystem from './GameItems/System/starSystem.js';
import Hyperspace from './GameItems/System/hyperspace.js';
import { MineralTypes } from './GameItems/minerals.js';
import Ship from './Ship/ship.js';
import Wormhole from './GameItems/System/wormhole.js';

const SYSTEM_NAMES = ["Asteel", "Brian"];

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
    systems = new Set();

    // Hyperspace system.
    hyperspace;

    // Current system
    system;
    systemCount = 0;

    maxRockCount;

    // All wormhole
    wormholes = new Set();

    static CBRT_THREE = Math.cbrt(3);
    static originVector = new THREE.Vector3(0, 0, 0);

    constructor(game, uniSize, systemSize, maxRockCount) {
        this.game = game;
        this.uniSize = uniSize;
        this.systemSize = systemSize;
        this.maxRockCount = maxRockCount;
        this.actualAnimateRate = game.ANIMATE_RATE;

    }

    populate() {
        // Create the ship.
        // Bootstrap by putting it in a temporary system.
        this.system = new System(this, "temp", this.systemSize, this.game.universe.originVector);
        this.createShip(this.system);

        // Create initial systems
        this.hyperspace = new Hyperspace(this, this.systemSize);
        let count = 0;
        for (let name of SYSTEM_NAMES) {
            let uniLoc;
            count ++;

            if (this.game.testMode) {
                uniLoc = new THREE.Vector3(500 * count, 0, 0);
            } else {
                // Locate system randomly in the universe
                let minDist;
                do {    
                    uniLoc = this.game.createRandomVector(this.systemSize);
                    minDist = this.systemSize;
                    for (let sys of this.systems) {
                        let relLoc = sys.uniLoc;
                        relLoc -= uniLoc;
                        if (relLoc.length < minDist) {
                            minDist = relLoc.length;
                        }
                    }
                } while (minDist < (this.systemSize/10));
            }
            let system = new StarSystem(this, name, this.systemSize, this.maxRockCount, uniLoc);
            this.systems.add(system);

            // First system is active.
            if (1 == count) {
                this.system = system;
            }

            // Create wormhole between this system and hyperspace.
            // Locate system end away from origin in system.
            let sysLoc;  if (this.game.testMode) {
                sysLoc = new THREE.Vector3(0, 500 * count, 0);
            } else {
                // Locate system randomly in the universe
                do {    
                    sysLoc = this.game.createRandomVector(this.systemSize);
                } while (sysLoc.length < (this.systemSize/2));
            }

            this.wormholes.add(new Wormhole(system, sysLoc, uniLoc));
        }

        // Put ship into current system.
        this.ship.setSystem(this.system);
        this.system.populate();

        // Make system graphics active.
        // this.system.setActive(true);
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
    
    createShip(system) {
        if (this.game.testMode) {
            this.ship = new Ship(system, 5, 10, 20, 0, 0, 0);

            // Do some damage
            this.ship.hull.compSets.takeDamage(1);

            // Add some minerals to the cargo.
            for (let i = 1; i < 3; i++) {
                let type = 1 + Math.floor(Math.random() * (MineralTypes.length - 1));
                this.ship.loadMineral(MineralTypes[type], i);
            }

            // Add some components to cargo.
            // Ugg ... just get first element.
            for (let comp of this.game.purchaseList.weaponSet) {
                comp = comp.buy(this.ship, true);
                comp.takeDamage(1);
                break;
            }

            // Add another cargo bay
            for (let bay of this.game.purchaseList.baySet) {
                bay = bay.mount(this.ship, true);
                bay.takeDamage(1);
                break;
            }
        } else {
            this.ship = new Ship(system, 5, 10, 20, -200, 100, 0);
        }
    }
}

export default Universe;