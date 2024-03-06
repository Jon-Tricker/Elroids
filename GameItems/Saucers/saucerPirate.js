// Pirate saucer
// Tries to steal minerals.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Saucer from './saucer.js';
import Universe from '../../universe.js';
import Mineral from '../mineral.js';

const COLOUR = "#505050";
const SIZE = 20;
const MASS = 20;
const MAX_SPEED = 80;  // m/s
const MAX_ACC = 10;      // m/s^2
const DECAY_RATE = 2    // t/s

const SHOOT_FREQUENCY = 200;
const MAX_RANGE = 500;

class SaucerPirate extends Saucer {

    cargoType;
    cargoMass = 0;      // t

    // Target mineral
    target = null;

    farAway = null;
    shootDue = 0;

    constructor(locationX, locationY, locationZ, game, owner, safe) {
        super(SIZE, locationX, locationY, locationZ, game, MASS, COLOUR, owner, safe);
    }

    getMaxSpeed() {
        return (MAX_SPEED);
    }

    animate(date) {
        // Decay cargo
        if (0 < this.cargoMass) {
            this.cargoMass -= DECAY_RATE / Universe.getAnimateRate();
        }

        super.animate(date);
    }

    // Do navigation.
    navigate() {
        let targetLoc;
        if (0 < this.cargoMass) {
            // Run away
            if (null == this.farAway) {
                this.farAway = this.game.getFarAway(this.location);
            }
            targetLoc = this.farAway;
        } else {
            if ((null == this.target) || (0 == this.target.hitPoints)) {
                // Find a new target
                if (null == this.farAway) {
                    this.target = this.getTarget();
                }
            }

            if (null == this.target) {
                return;
            }
            
            targetLoc = this.target.location;
        }

        // Home on target location        
        let targetSpeed = this.getRelativePosition(targetLoc);

        targetSpeed.normalize();
        targetSpeed.multiplyScalar(-MAX_SPEED);

        let delta = targetSpeed.clone();
        delta.sub(this.speed);

        if (delta.length() > MAX_ACC / Universe.getAnimateRate()) {
            delta.normalize;
            delta.multiplyScalar(MAX_ACC / Universe.getAnimateRate());
        }

        let newSpeed = this.speed.clone();
        newSpeed.add(delta);
        this.setSpeed(newSpeed);
    }

    // Do shooting logic
    shoot() {
        // Only shoot if running
        if (null != this.farAway) {
            if (!this.safe) {
                if (this.shootDue++ >= SHOOT_FREQUENCY) {

                    // Only fire if vaguley close enough.
                    let range = this.getRelativePosition(this.game.getShip().location);
                    range.multiplyScalar(-1);

                    if (MAX_RANGE > range.length()) {
                        range.normalize();
                        new DumbMissile(range, this);
                        shootDue = 0;
                    }
                }
            }
        }
    }

    // Get high value target.
    // null if none available.
    getTarget() {
        let maxValTarget = null;
        for (let that of Universe.itemList) {
            if (that instanceof Mineral) {
                if ((null == maxValTarget) || (that.getValue() > maxValTarget.getValue())) {
                    maxValTarget = that;
                }
            }
        }
        return (maxValTarget);
    }

    handleSpecialCollisions(that) {
        if (that instanceof Mineral) {
            return (this.mineralPickup(that));
        }
        return (false);
    }

    destruct() {
        // If cargo on board make new mineral.
        this.cargoMass = Math.floor(this.cargoMass);
        if (0 < this.cargoMass) {
            new Mineral(this.cargoMass, this.location.x, this.location.y, this.location.z, this.speed.x, this.speed.y, this.speed.z, this.game, this.cargoType);
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
        return (30);
    }
}

export default SaucerPirate;