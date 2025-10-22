// A normal star system.
import * as THREE from 'three';
import { System } from './system.js'
import PlayerShip from '../../Ships/playerShip.js';
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
import { SystemSpec } from './system.js';
import Freighter from '../../Ships/NonPlayerShips/Freighter.js';
import NPShipFactory from '../../Ships/NonPlayerShips/NonPlayerShipFactory.js';

// Box to clear out arround respawn site.
const RESPAWN_SIZE = 250;           // m

// How often (average) are NPShips spawned.
const NP_SHIP_FREQUENCY = 120000     // ms

class StarSystem extends System {
    saucerCount = 0;
    rockCount = 0;
    maxRockCount;

    // Non player ship timer.
    nPShipTimer = 0;

    // Special items in the system.
    motherSaucers = new Set();
    stations = new Set();

    constructor(universe, spec, systemSize, maxRockCount, uniLocation, background, json) {
        super(universe, spec, systemSize, uniLocation, background, json);
        this.maxRockCount = maxRockCount;
        this.createStations(json);

        // When we create the system don't yet have a ship. So saucers cannot target it.
        // Hold off saucer creation till latter.
        // this.createSaucers(json);

        this.createRocks(this.maxRockCount);
    }

    toJSON() {
        let json = super.toJSON();

        json.maxRockCount = this.maxRockCount;

        // Add stations. 
        let stations = [];
        for (let station of this.stations) {
            stations.push(station.toJSON());
        }
        json.stations = stations;

        json.skyBox = this.skyBox.toJSON();

        let saucers = [];
        for (let saucer of this.motherSaucers) {
            saucers.push(saucer);
        }
        json.saucers = saucers;

        return (json);
    }

    static fromJSON(json, universe) {
        let system = new StarSystem(universe, SystemSpec.fromJSON(json.spec), json.systemSize, json.maxRockCount, json.uniLocation, json.background, json);
        return (system);
    }

    addStation(station) {
        this.stations.add(station);
    }

    getStations() {
        return (this.stations);
    }

    animate(date, keyBoard) {
        // If necesarry top up rocks.
        if (this.rockCount < this.maxRockCount) {
            this.createRandomRock(this.getGame().getFarAway(this.getShip().location));
        }

        if (!this.getGame().testMode) {
            // If mother saucer detroyed periodicaly re-create
            if (0 == this.motherSaucers.size) {
                if ((Math.random() * 1000) < 1) {
                    this.createMotherSaucer(this.safe);
                }
            }
        }

            if (date > this.nPShipTimer) {
                // Genrate new NPShip from one of the wormhole ends.
                let wormholeEnd = this.wormholeEnds.getRandomElement();
                let npShip = NPShipFactory.createRandom(this, wormholeEnd.location);
                npShip.setSpeed(this.getGame().createRandomVector(10));
                npShip.setActive(true);
                wormholeEnd.exit(npShip);

                this.nPShipTimer = date + NP_SHIP_FREQUENCY * (1 + Math.random()) * 0.5;
            }

        super.animate(date, keyBoard)
    }

    clearRespawnArea() {
        this.clearBox(-RESPAWN_SIZE, -RESPAWN_SIZE, -RESPAWN_SIZE, RESPAWN_SIZE, RESPAWN_SIZE, RESPAWN_SIZE);
    }

    // Move everything out of a box Could be more sophisticated.
    clearBox(xmin, ymin, zmin, xmax, ymax, zmax) {

        let min = new THREE.Vector3(xmin, ymin, zmin);
        let max = new THREE.Vector3(xmax, ymax, zmax);
        let clearBox = new THREE.Box3(min, max);

        let sz = this.systemSize / 2;
        for (let item of this.items) {
            if (!(item instanceof PlayerShip) && !(item instanceof Station)) {
                let thatBoundary = item.getBoundary();
                if ((null != thatBoundary) && (thatBoundary.intersectsBox(clearBox))) {
                    let loc = item.getLocation();

                    // Bounce it far away.
                    if (loc.x < 0) {
                        loc.x += sz;
                    } else {
                        loc.x -= sz;
                    }

                    if (loc.y < 0) {
                        loc.y += sz;
                    } else {
                        loc.y -= sz;
                    }

                    if (loc.z < 0) {
                        loc.z += sz;
                    } else {
                        loc.z -= sz;
                    }
                    item.setLocation(loc);
                }
            }
        }
    }

    createRocks(rockCount) {
        if (this.getGame().testMode) {
            // Create a few test rocks at set locations

            // Horizontal colliders
            // new Rock(this, 20, 100, 50, 0, 0, 0, 0);
            // new Rock(this, 10, 100, -50, 10, 0, 25, 0);

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

            // Add sample goods crates.
            let good = new (this.universe.game.goodsList.getByClass("Gun")).constructor();
            good.number = 50;
            good.makeCrate(this, 250, 10, 50, 0, 0, 0);

            let comp = new (this.universe.game.componentsList.getByClass("BasicEngine")).constructor();
            comp.number = 1;
            comp.makeCrate(this, 270, 10, 70, 0, 0, 0);

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

        let rock = new Rock(this, sz, loc.x, loc.y, loc.z, maxVel.x, maxVel.y, maxVel.z);
    };

    createStations(json) {
        if (undefined === json) {
            // Create new stations.
            let station;
            if (this.getGame().testMode) {
                station = new Station(this, 1100, 0, 0, null);
                // station = new Station(200, 0, 0, this, null);
            } else {
                station = new Station(this, 0, 0, 0, null);
            }
            this.stations.add(station);
        } else {
            // Restore old stations.
            for (let station of json.stations) {
                let newStation = Station.fromJSON(station, this);
                this.stations.add(newStation);
            }
        }
    }

    createSaucers(json) {
        if (undefined === json) {
            if (this.getGame().testMode) {
                // New saucer
                /*
                new SaucerStatic(this, 200, 100, -50, false);
                new SaucerWanderer(this, 400, 100, -50, null, true);
                new SaucerShooter(this, 300, 100, -50, null, true);
                new SaucerHunter(this, 300, 200, -50, null, true);
                new SaucerRam(this, 1000, 200, 200, null, true);
                new SaucerPirate(this, 1500, 200, -50, null, true);
                */
            }
            // First mother ship in home system always in safe mode.
            this.createMotherSaucer(this.spec.name == "Sol");   // Ugg!
        } else {
            // Restore old saucers.
            for (let saucer of json.saucers) {
                let newSaucer = SaucerMother.fromJSON(saucer, this);
                this.motherSaucers.add(newSaucer);
            }
        }
    }

    createNPShips(json) {
        // Don't restore NP ships.
        if (undefined === json) {
            if (this.getGame().testMode) {
                // new Freighter(this, new THREE.Vector3(200, -100, 50));
            }
        }
    }

    createMotherSaucer(safe) {
        let loc;
        let game = this.getGame();

        // Create it close so we can find it. 
        if (this.getGame().testMode) {
            loc = new THREE.Vector3(1000, 100, -50);
            safe = true;
        } else {
            if (safe) {
                loc = this.universe.ship.getLocation().clone();
                let offset = 1000;
                loc.x += offset;
                loc.y += offset / 2;
                this.universe.handleWrap(loc);
            } else {
                loc = game.getFarAway(this.universe.ship.location);
            }
        }

        this.motherSaucers.add(new SaucerMother(this, loc.x, loc.y, loc.z, null, safe));

        // Game gradually gets harder.
        game.maxSaucerCount++;
    }

    removeMotherSaucer(saucer) {
        // console.log("MS destoryed");
        this.motherSaucers.delete(saucer);
    }
}

export default StarSystem;