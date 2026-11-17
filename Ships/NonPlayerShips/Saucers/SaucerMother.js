// Mother saucer.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Game from '../../../Game/game.js';
import { Saucer, SaucerAI } from './Saucer.js';
import SaucerHull from '../../Components/Hulls/saucerHull.js';
import BasicEngine from '../../Components/Engines/basicEngine.js';
import SaucerShooter from './SaucerShooter.js';
import SaucerHunter from './SaucerHunter.js';
import SaucerPirate from './SaucerPirate.js';
import SaucerRammer from './SaucerRammer.js';
import { Color } from 'three';
import Ballast from '../../Components/Bays/ballast.js';
import BasicBay from '../../Components/Bays/basicBay.js';

const COLOUR = new Color("#80FF80");
const SIZE = 50;

const START_SPAWN_FREQUENCY = 20000;    // m/s
const MAX_SPAWN_FREQUENCY = 10000;      // m/s
const RELOC_FREQUENCY = 5000;          // m/s

const INITIAL_CARGO_VALUE = 400;

class MotherAI extends SaucerAI {

    currentSpawnFrequency = START_SPAWN_FREQUENCY;
    relocTime;
    spawnTime;

    constructor(myShip) {
        super(myShip);
    }

    // See extensive comment in parent class.
    hostileProgram(date) {
        let done = false;

        switch (this.pc) {

            case 0:
                if (Game.getGame().isSafe()) {
                    // Do nothing
                    let timeOut = this.wait(date, 1000);

                    if (timeOut) {
                        this.pc = 0;
                    }
                } else {
                    done = true;
                }
                break;

            case 1:
                // Get location if reqd.
                if (undefined == this.dest) {
                    this.dest = this.createRunLocation();
                    this.relocTime = date + RELOC_FREQUENCY;
                }

                // Move to location.
                done = this.navigateThrough(this.getTargetLocation(this.dest));

                // If necessary spawn.
                if (undefined == this.spawnTime) {
                    this.spawnTime = date + this.currentSpawnFrequency;
                }

                if (date > this.spawnTime) {
                    this.myShip.spawn();

                    // Get faster with time.
                    if (this.currentSpawnFrequency >= MAX_SPAWN_FREQUENCY) {
                        this.currentSpawnFrequency--;
                    }

                    this.spawnTime = undefined;
                }

                // Periodically relocate.
                if (date > this.relocTime) {
                    this.dest = undefined;
                    done = true;
                }

                break;

            // Loop forever.
            default:
                this.pc = 0;
                break;
        }

        if (done) {
            this.incPc();
        }
    }

    // Create a location far from ship.
    createRunLocation() {
        return (Game.getGame().getShip().getLocation().getFarAway());
    }

    wait(date, duration) {
        if (undefined == this.expire) {
            // Set a new expiry time
            this.expire = date + duration;
            return (false);
        }

        if (this.expire < date) {
            // Expired.
            this.expire = undefined;
            return (true);
        }
        return (false);
    }
}

class SaucerMother extends Saucer {

    constructor(location, speed) {
        super(SIZE, location, speed);

        this.ai = new MotherAI(this);
    }

    getName() {
        return ("Mothersaucer");
    }

    buildShip() {
        this.hull = new SaucerHull(this.compSets.hullSet, COLOUR);
        this.hull.setSlots(this.compSets);

        // Do custom stuff for this hull
        new BasicEngine(this.compSets.engineSet);
        new BasicBay(this.compSets.baySet);

        // Add some balast to up weight.
        new Ballast(this.compSets.baySet, 500);

        this.compSets.baySet.loadRandomCargo(INITIAL_CARGO_VALUE);

        this.recalc();
    }

    // Spawn new saucer.
    spawn() {
        let game = Game.getGame();

        if (!game.isSafe()) {
            if (game.getSystem().saucerCount < game.maxSaucerCount) {
                let thisLoc = this.getLocation();

                let type = Math.floor(Math.random() * 4)
                switch (type) {
                    case 0:
                        new SaucerShooter(thisLoc);
                        break;

                    case 1:
                        new SaucerHunter(thisLoc);
                        break;

                    case 2:
                        new SaucerPirate(thisLoc);
                        break;

                    default:
                        new SaucerRammer(thisLoc);
                        break;
                }
            }
        }
    }
}

export default SaucerMother;