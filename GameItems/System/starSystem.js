// A normal star system.
import * as THREE from 'three';
import Game from '../../Game/game.js';
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
import Station from './station.js';
import { SystemSpec } from './system.js';
import Freighter from '../../Ships/NonPlayerShips/freighter.js';
import NPShipFactory from '../../Ships/NonPlayerShips/nPShipFactory.js';
import Location from '../../Game/Utils/location.js';
import PoliceShip from '../../Ships/NonPlayerShips/policeShip.js';
import Utils from '../../Game/Utils/utilities.js';

// Box to clear out arround respawn site.
const RESPAWN_SIZE = 250;           // m

// How often (average) are NPShips spawned.
const NP_SHIP_FREQUENCY = 60000     // ms

class StarSystem extends System {
    rockCount = 0;
    maxRockCount;

    saucerCount = 0;

    // Non player ship timer.
    nPShipTimer = 0;

    // Special items in the system.
    motherSaucers = new Set();
    stations = new Set();
    policeShips = new Set();

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

    addPolice(ship) {
        this.policeShips.add(ship);
    }

    deletePolice(ship) {
        this.policeShips.delete(ship);
    }

    getPolice() {
        return (this.policeShips);
    }

    recalcPoliceHostility() {
        for(let police of this.policeShips) {
            police.recalcHostility();
        }
    }

    animate(date, keyBoard) {
        // If necesarry top up rocks.
        if (this.rockCount < this.maxRockCount) {
            this.createRandomRock(Game.getGame().getShip().location.getFarAway());
        }

        if (!Game.getGame().testMode) {
            // If mother saucer detroyed periodicaly re-create
            if (0 == this.motherSaucers.size) {
                if ((Math.random() * 1000) < 1) {
                    this.createMotherSaucer();
                }
            }
        }

        if ((date > this.nPShipTimer) && (!Game.getGame().testMode)) {
            // Genrate new NPShip from one of the wormhole ends.
            let wormholeEnd = this.wormholeEnds.getRandomElement();
            let npShip = NPShipFactory.createRandom(wormholeEnd.location, true);
            npShip.setActive(true);
            wormholeEnd.exit(npShip);

            // Top up police ships.
            if (this.policeShips.size < Math.floor(this.getLawLevel() / 2)) {
                let police = new PoliceShip(Game.getGame().getShip().location.getFarAway());
                police.setActive(true);
                this.addPolice(police);
            }

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
                if (clearBox.containsPoint(item.getLocation())) {
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
        if (Game.getGame().testMode) {
            // Create a few test rocks at set locations

            // Horizontal colliders
            new Rock(20, new Location(200, 100, 50, this), new THREE.Vector3());
            new Rock(10, new Location(200, -50, 50, this), new THREE.Vector3(0, 25, 0));

            // Point blank shot
            // new Rock(5, new Location(20, 0, 0, this), new THREE.Vector3(0, 0, 0));

            // Big target
            // new Rock(20, new Location(100, 0, 0, this),new THREE.Vector3() );

            // Small target
            // new Rock(80, new Location(100, 0, 0, this), new THREE.Vector3());

            // Row of rocks
            for (let i = -this.systemSize; i < this.systemSize; i += 211) {
                let sz = Math.abs(i % Game.getGame().getMaxRockSize());
                if (sz != 0) {
                    new Rock(sz, new Location(i, -100, 0, this), new THREE.Vector3());
                }
            }

            // Diagonal row of rocks.
            /*
            for (let i = 0; i < this.systemSize ; i += 211) {
                let sz = i % MAX_ROCK_SIZE;
                new Rock(sz, new Location(i, i, i), new THREE.Vector3());
            }
            */

            // One of each ship type.
            let count = 0;
            for (let type of NPShipFactory.shipTypes) {
                let yLoc = (NPShipFactory.shipTypes.size / 2 - count) * 100;
                let location = new Location(2000, yLoc, 200, this);
                NPShipFactory.createShip(type, location, undefined);
                count++;
            }

            // And a sample mineral
            new Mineral(100, new Location(250, -10, 50, this), new THREE.Vector3(), MineralTypes[2]);
            new Mineral(100, new Location(500, 50, 50, this), new THREE.Vector3(), MineralTypes[3]);

            // Add sample goods crates.
            let good = new (Game.getGame().goodsList.getByClass("Gun")).constructor();
            good.number = 50;
            good.makeCrate(new Location(250, 10, 50, this), new THREE.Vector3());

            let comp = new (Game.getGame().componentsList.getByClass("BasicEngine")).constructor();
            comp.number = 1;
            comp.makeCrate(new Location(270, 10, 70, this), new THREE.Vector3());

        } else {
            // Create a bunch of random rocks
            for (let r = 0; r <= rockCount; r++) {
                let loc = Location.createRandomInSystem(this, true);
                this.createRandomRock(loc);
            }

            this.clearRespawnArea();
        }
    }

    createRandomRock(loc) {
        let game = Game.getGame();
        let maxVel = Utils.createRandomVector(game.getMaxRockVelocity());
        let sz = Math.floor((Math.random() * game.getMaxRockSize()) + 10);

        new Rock(sz, loc, maxVel);
    };

    createStations(json) {
        if (undefined === json) {
            // Create new stations.
            let station;
            if (Game.getGame().testMode) {
                // station = new Station(new Location(-4900, 0, 0, this), null);
                station = new Station(new Location(1100, 0, 0, this), null);
            } else {
                station = new Station(new Location(0, 0, 0, this), null);
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
            this.createMotherSaucer();
        } else {
            // Restore old saucers.
            for (let saucer of json.saucers) {
                let newSaucer = SaucerMother.fromJSON(saucer, this);
                this.motherSaucers.add(newSaucer);
            }
        }
    }

    createMotherSaucer() {
        let loc;
        let game = Game.getGame();

        // Create it close so we can find it. 
        let hole = this.wormholeEnds.getRandomElement();
        if (Game.getGame().testMode) {
            loc = new Location(1000, 100, -50, this);
        } else {
            // Spawn from a wormhole.
            loc = hole.location;
        }

        let saucer = new SaucerMother(loc, null);
        this.motherSaucers.add(saucer);

        // Game gradually gets harder.
        game.maxSaucerCount++;
    }

    removeMotherSaucer(saucer) {
        // console.log("MS destoryed");
        this.motherSaucers.delete(saucer);
    }
}

export default StarSystem;