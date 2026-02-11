// Pirate saucer
// Tries to steal minerals.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';
import Saucer from './saucer.js';
import Mineral from '../mineral.js';
import DumbMissile from '../../GameItems/dumbMissile.js'
import Location from '../../Game/Utils/location.js';

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

    constructor(location, owner) {
        super(SIZE, location, MASS, COLOUR, owner);
    } 
    
    getName() {
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
                this.farAway = game.getShip().location.getFarAway();
            }
            targetLoc = this.farAway;
        } else {
            if ((undefined == this.target) || this.target.isDestructed()) {
                // Find a new target
                this.target = this.location.system.getValuable(Mineral, this.location);
            }

            if (undefined == this.target) {
                // Loiter
                this.farAway = this.createLoiterLocation();
                targetLoc = this.farAway;
            } else {
                targetLoc = this.target.location;
            }
        }

        // Home on target location 
        let targetSpeed = this.location.getRelative(targetLoc);
        this.thrust(THRUST, targetSpeed, MAX_SPEED);
    }

    getTotalMass() {
        return(this.mass + this.cargoMass);
    }

    createLoiterLocation() {
        this.targetLocation = this.getGame().getShip().getLocation().clone();

        let offset = this.getGame().createRandomVector(STANDOFF_DISTANCE)
        this.targetLocation.add(offset);

        return(this.targetLocation);
    }

    // Do shooting logic
    shoot() {
        // Only shoot if running
        if (0 != this.cargoMass) {
            if (!this.getGame().isSafe()) {
                if (this.shootDue++ >= SHOOT_FREQUENCY) {

                    // Only fire if vaguley close enough.
                    let range = this.location.getRelative(this.getGame().getShip().location);

                    if (MAX_RANGE > range.length()) {
                        // range.normalize();
                        new DumbMissile(new THREE.Vector3(range.x, range.y, range.z), this);
                        this.shootDue = 0;
                    }
                }
            }
        }
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
            let min = new Mineral(this.cargoMass, this.location, this.speed, this.cargoType);
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