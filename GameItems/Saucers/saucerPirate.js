// Pirate saucer
// Tries to steal minerals.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Saucer from './saucer.js';
import Mineral from '../mineral.js';
import DumbMissile from '../../GameItems/dumbMissile.js'

const COLOUR = "#202060";
const SIZE = 20;
const MASS = 20;
const MAX_SPEED = 100;  // m/s
const THRUST = 2000     // kN
const DECAY_RATE = 2    // t/s

const SHOOT_FREQUENCY = 200;
const MAX_RANGE = 500;
const STANDOFF_DISTANCE = 500;

class SaucerPirate extends Saucer {

    cargoType;
    cargoMass = 0;      // t

    // Target mineral
    target = null;

    farAway = null;
    shootDue = 0;

    constructor(system, locationX, locationY, locationZ, owner, safe) {
        super(system, SIZE, locationX, locationY, locationZ, MASS, COLOUR, owner, safe);
    }

    getClass() {
        return("Pirate");
    }

    getMaxSpeed() {
        return (MAX_SPEED);
    }

    animate(date) {
        // Decay cargo
        if (0 < this.cargoMass) {
            this.cargoMass -= DECAY_RATE / this.getGame().getAnimateRate();
        }

        super.animate(date);
    }

    // Do navigation.
    navigate() {
        let targetLoc;
        if (0 < this.cargoMass) {
            // Run away
            if (null == this.farAway) {
                let game = this.getGame();
                this.farAway = game.getFarAway(game.getShip().location);
            }
            targetLoc = this.farAway;
        } else {
            if ((null == this.target) || (0 == this.target.hitPoints)) {
                // Find a new target
                this.target = this.getTarget();
            }

            if (null == this.target) {
                // Loiter
                this.farAway = this.createLoiterLocation();
                targetLoc = this.farAway;
            } else {
                targetLoc = this.target.location;
            }
        }

        // Home on target location 
        let targetSpeed = this.getRelativeLocation(targetLoc);
        this.thrust(THRUST, targetSpeed, MAX_SPEED);
    }

    getMass() {
        return(this.mass + this.cargoMass);
    }

    createLoiterLocation() {
        this.targetLocation = this.getGame().getShip().location.clone();

        let offset = this.getGame().createRandomVector(STANDOFF_DISTANCE)
        this.targetLocation.add(offset);

        return(this.targetLocation);
    }

    // Do shooting logic
    shoot() {
        // Only shoot if running
        if (0 != this.cargoMass) {
            if (!this.safe) {
                if (this.shootDue++ >= SHOOT_FREQUENCY) {

                    // Only fire if vaguley close enough.
                    let range = this.getRelativeLocation(this.getGame().getShip().location);

                    if (MAX_RANGE > range.length()) {
                        range.normalize();
                        new DumbMissile(range, this);
                        this.shootDue = 0;
                    }
                }
            }
        }
    }

    // Get high value target.
    // null if none available.
    getTarget() {
        let maxValTarget = null;
        for (let that of this.system.items) {
            if (that instanceof Mineral) {
                if ((null == maxValTarget) || (that.getValue() > maxValTarget.getValue())) {
                    maxValTarget = that;
                }
            }
        }
        return (maxValTarget);
    }

    handleCollision(that) {
        if (that instanceof Mineral) {
            return (this.mineralPickup(that));
        }

        super.handleCollision(that);
    }

    destruct() {
        // If cargo on board make new mineral.
        this.cargoMass = Math.floor(this.cargoMass);
        if (0 < this.cargoMass) {
            new Mineral(this.system, this.cargoMass, this.location.x, this.location.y, this.location.z, this.speed.x, this.speed.y, this.speed.z, this.cargoType);
        }
        super.destruct();
    }

    mineralPickup(that) {
        this.cargoType = that.type;
        this.cargoMass = that.mass;
        that.destruct();

        // Find new hiding place
        this.farAway = null;

        return (true);
    }

    getScore() {
        return (60);
    }
}

export default SaucerPirate;