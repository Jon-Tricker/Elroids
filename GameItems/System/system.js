// A star system.
//
// Includes all the parts that do not persist when in other systems.
import * as THREE from 'three';
import Ship from '../../Ship/ship.js';
import Rock from '../rock.js';
import Mineral from '../mineral.js';
import { MineralTypes } from '../minerals.js';
import SaucerHunter from '../Saucers/saucerHunter.js';
import SaucerMother from '../Saucers/saucerMother.js';
import SaucerRam from '../Saucers/saucerRam.js';
import SaucerPirate from '../Saucers/saucerPirate.js';
import SaucerShooter from '../Saucers/saucerShooter.js';
import SaucerStatic from '../Saucers/saucerStatic.js';
import SaucerWanderer from '../Saucers/saucerWanderer.js';
import Station from './station.js';
import Wormhole from './wormhole.js';

// Box to clear out arround respawn site.
const RESPAWN_SIZE = 250;          // m

class System {
    saucerCount = 0;
    motherSaucerCount = 0;
    rockCount = 0;
    maxRockCount;

    // Back reference to out parent.
    universe;

    // Size of this system
    systemSize;

    // Stations in the system.
    stations = new Set();

    // Wormholes in the system.
    wormholes = new Set();

    // All items in system.
    items = new Set();

    ship;

    constructor(universe, systemSize, maxRockCount) {
        this.systemSize = systemSize;
        this.universe = universe;
        this.maxRockCount = maxRockCount;
    }

    populate() {
        this.createRocks(this.maxRockCount);
        this.createShip()
        this.createSaucers();
        this.createStation();
        this.createWormholes();
    }

    getGame() {
        return (this.universe.game);
    }
    addItem(item) {
        this.items.add(item);
    }

    removeItem(item) {
        this.items.delete(item);
    }

    addStation(station) {
        this.stations.add(station);
    }

    getStations() {
        return (this.stations);
    }

    addWormhole(hole) {
        this.wormholes.add(hole);
    }

    getWormholes() {
        return (this.wormholes);
    }

    animate(date, keyBoard) {
        // If necesarry top up rocks.
        if (this.rockCount < this.maxRockCount) {
            this.createRandomRock(this.getGame().getFarAway(this.getShip().location));
        }

        if (!this.getGame().testMode) {
            // If mother saucer detroyed periodicaly re-create
            if (0 == this.motherSaucerCount) {
                if ((Math.random() * 1000) < 1) {
                    this.createMotherSaucer(this.safe);
                }
            }
        }

        for (let item of this.items) {
            item.animate(date, keyBoard);
        }
    }

    getGame() {
        return (this.universe.game);
    }

    clearRespawnArea() {
        this.clearBox(-RESPAWN_SIZE, -RESPAWN_SIZE, -RESPAWN_SIZE, RESPAWN_SIZE, RESPAWN_SIZE, RESPAWN_SIZE);
    }

    // Move everything out of a box Could be more sophisticated.
    clearBox(xmin, ymin, zmin, xmax, ymax, zmax) {

        let min = new THREE.Vector3(xmin, ymin, zmin);
        let max = new THREE.Vector3(xmax, ymax, zmax);
        let clearBox = new THREE.Box3(min, max);

        let sz = this.systemSize;
        for (let item of this.items) {
            let thatBoundary = item.getBoundary();
            if ((null != thatBoundary) && (thatBoundary.intersectsBox(clearBox))) {
                // Bounce it far away.
                if (item.location.x < 0) {
                    item.location.x += sz;
                } else {
                    item.location.x -= sz;
                }

                if (item.location.y < 0) {
                    item.location.y += sz;
                } else {
                    item.location.y -= sz;
                }

                if (item.location.z < 0) {
                    item.location.z += sz;
                } else {
                    item.location.z -= sz;
                }
            }
        }
    }

    createShip() {
        if (this.getGame().testMode) {
            this.ship = new Ship(this, 5, 10, 20, 0, 0, 0);

            // Do some damage
            this.ship.hull.compSets.takeDamage(1);

            // Add some minerals to the cargo.
            for (let i = 1; i < 3; i++) {
                let type = 1 + Math.floor(Math.random() * (MineralTypes.length - 1));
                this.ship.loadMineral(MineralTypes[type], i);
            }

            // Add some components to cargo.
            // Ugg ... just get first element.
            for (let comp of this.getGame().purchaseList.weaponSet) {
                comp = comp.buy(this.ship, true);
                comp.takeDamage(1);
                break;
            }

            // Add another cargo bay
            for (let bay of this.getGame().purchaseList.baySet) {
                bay = bay.mount(this.ship, true);
                bay.takeDamage(1);
                break;
            }
        } else {
            this.ship = new Ship(this, 5, 10, 20, -200, 100, 0);
        }

    }

    createRocks(rockCount) {
        if (this.getGame().testMode) {
            // Create a few test rocks at set locations

            // Horizontal colliders
            new Rock(this, 20, 100, 50, 0, 0, 0, 0);
            new Rock(this, 10, 100, -50, 10, 0, 25, 0);

            // Big target
            // new Rock(this, 20, 100, 0, 0, 0, 0, 0);

            // Small target
            // new Rock(this, 80, -100, 0, 0, 0, 0, 0);

            // Row of rocks
            for (let i = -this.systemSize; i < this.systemSize; i += 211) {
                let sz = Math.abs(i % this.universe.game.getMaxRockSize());
                if (sz != 0) {
                    new Rock(this, sz, i, -100, 0, 0, 0, 0);
                }
            }

            // Diagonal row of rocks.
            /*
            for (let i = 0; i < this.systemSize ; i += 211) {
                let sz = i % MAX_ROCK_SIZE;
                new Rock(this, sz,  i, i, i, 0, 0, 0);
            }
            */

            // And a sample mineral
            new Mineral(this, 100, 250, -10, 50, 0, 0, 0, MineralTypes[2]);
            new Mineral(this, 100, 500, 50, 50, 0, 0, 0, MineralTypes[3]);

        } else {
            // Create a bunch of random rocks
            for (let r = 0; r <= rockCount; r++) {
                let loc = new THREE.Vector3(Math.random() * this.systemSize * 2 - this.systemSize, Math.random() * this.systemSize * 2 - this.systemSize, Math.random() * this.systemSize * 2 - this.systemSize);
                this.createRandomRock(loc);
            }

            this.clearRespawnArea();
        }
    }

    createRandomRock(loc) {
        let game = this.universe.game;
        let maxVel = game.createRandomVector(game.getMaxRockVelocity());
        let sz = Math.floor((Math.random() * game.getMaxRockSize()) + 10);

        new Rock(this, sz, loc.x, loc.y, loc.z, maxVel.x, maxVel.y, maxVel.z);
    };


    createWormholes() {
        let wormhole;
        if (this.getGame().testMode) {
            wormhole = new Wormhole(this, 500, 100, 150, "Wormhole");
        }

        if (undefined != wormhole) {
            this.wormholes.add(wormhole);
        }
    }

    createStation() {
        let station;
        if (this.getGame().testMode) {
            station = new Station(this, 1100, 0, 0, null);
            // station = new Station(200, 0, 0, this, null);
        } else {
            station = new Station(this, 0, 0, 0, null);
        }
        this.stations.add(station);
    }

    createSaucers() {
        if (this.getGame().testMode) {
            // New saucer
            new SaucerStatic(this, 200, 100, -50, false);
            new SaucerWanderer(this, 400, 100, -50, null, false);
            new SaucerShooter(this, 300, 100, -50, null, true);
            new SaucerHunter(this, 300, 200, -50, null, true);
            new SaucerRam(this, 1000, 200, 200, null, true);
            new SaucerPirate(this, 1500, 200, -50, null, true);
            new SaucerMother(this, 1000, 100, -50, null, true);
        } else {
            // First mother ship always in safe mode.
            this.createMotherSaucer(true);
        }
    }

    createMotherSaucer(safe) {
        let loc;
        let game = this.getGame();

        // Create it close so we can find it.
        if (safe) {
            loc = this.ship.location.clone();
            let offset = 1000;
            loc.x += offset;
            loc.y += offset / 2;
            this.universe.handleWrap(loc);
        } else {
            loc = game.getFarAway(this.ship.location);
        }
        new SaucerMother(this, loc.x, loc.y, loc.z, null, safe);

        this.motherSaucerCount++;

        // Game gradually gets harder.
        game.maxSaucerCount++;
    }

    removeMotherSaucer() {
        // console.log("MS destoryed");
        this.motherSaucerCount--;
    }
}

export default System;