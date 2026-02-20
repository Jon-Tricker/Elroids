// Simple non-player ship AI.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';
import Item from '../../GameItems/item.js';
import Station from '../../GameItems/System/station.js';
import PlayerShip from '../playerShip.js';

// Minimum turn threshold
// Found, by experimentation, to prevent 'seeking'. 
// TODO: Someone who is better at control theory than me please fix.
const THRESHOLD = 0.1;

// Maximum range to open fire.
// ToDO : Possibly should be weapon dependant.
const MAX_FIRE_RANGE = 500;

// Max angle to open fire.
const MAX_FIRE_ANGLE = Math.PI / 100;

// Max angle to thrust.
const MAX_THRUST_ANGLE = Math.PI / 16;

// Optimal fire range.
const FIRE_RANGE = 300;

// Average fire frequency
const FIRE_FREQ = 1000;  // ms

class BasicAI {
    // Attitude to player.
    hostile = false;

    // Program counter.
    pc = 0;

    // Wait timer
    expire = undefined;

    myShip;

    // Destination may be an item or a location.
    dest = undefined;

    constructor(myShip) {
        this.myShip = myShip;
    }

    animate(date) {
        let step = false;

        if (this.hostile) {
            step = this.hostileProgram(date);
        } else {
            step = this.program(date);
        }

        if (step) {
            this.incPc();
        }
    }

    // The 'program' for this AI type. Used when not in hostile mode.
    //
    // Return 'true' if pc should advance.
    //
    // This used to be a list of defined 'Navigation modes' however this was found to be too inflexible (couldn't do arbitary loops, branches etc.).
    // So now each time it is called exeutes a block of code based on a 'pc' and updates the 'pc' dependant on the result.
    //
    // Copy/modify code blocks for differing ship types.
    //
    // ToDo: Ideally this should become some sort of, single stepable, meta language (possibly some sort of java script 'thread').
    program(date) {

        // Is step complete?
        // Also set to 'false' is step has explicitly modified the 'pc' (e.g. for a loop).
        let done = false;

        switch (this.pc) {
            case 0:
                done = this.navToRandomLocation(date);
                break;

            case 1:
                done = this.navToApproachPoint(date);
                break;

            case 2:
                done = this.dock(date);
                break;

            case 3:
                // Wait a while
                done = this.wait(date);
                break;

            case 4:
                // Undock.
                done = this.undock(date);
                break;

            case 5:
            default:
                done = this.navToWormhole(date);
                break;
        }

        return (done);
    }

    // Alternate program used when in hostile mode.
    hostileProgram(date) {
        let done = false;

        switch (this.pc) {
            case 0:
                // Run or fight?
                if (0.5 < Math.random()) {
                    this.pc = 1;
                } else {
                    this.pc = 2;
                }
                done = false;
                break;

            case 1:
                done = this.attackShip(date);
                if (done) {
                    this.setHostile(false);
                }
                break;

            case 2:
                done = this.navToWormhole(date);
                break;

            // Loop forever.
            default:
                this.pc = 0;
                break;
        }

        return (done);
    }

    incPc() {
        // No longer have dest
        this.dest = undefined;

        // If step done by default just inc the pc.
        this.pc++;
    }

    // Navigate to a random location.
    navToRandomLocation(date) {
        if (!this.haveDest()) {
            this.dest = this.myShip.getGame().createRandomVector(this.myShip.location.system.systemSize);
        }

        return (this.navigateThrough(this.dest));
    }

    // Navigate to station aproach point.
    navToApproachPoint(date) {
        if (!this.haveDest()) {
            this.dest = this.myShip.location.system.stations.values().next().value.getApproachPoint();
        }

        return (this.navigateThrough(this.dest));
    }

    // Navigate to wormhole.
    navToWormhole(date) {
        if (!this.haveDest()) {
            this.dest = this.myShip.location.system.wormholeEnds.values().next().value;
        }

        return (this.navigateThrough(this.dest));
    }

    // Navigate to cargo.
    navToCargo(date) {
        if (!this.haveDest()) {
            this.dest = this.myShip.location.system.getValuable(undefined, this.myShip.location);
        }

        return (this.navigateThrough(this.dest));
    }

    // Attack player ship
    attackShip(date) {
        if (!this.isHostile()) {
            // Nay worries mate!
            return (true);
        }
        return (this.attack(this.myShip.getGame().getShip(), date));
    }

    dock(date) {
        let ship = this.myShip;

        if (!this.haveDest()) {
            this.dest = ship.location.system.stations.values().next().value;
        }

        // If docking blocked give up.
        if (ship.getLocation().distanceTo(this.dest.getLocation()) > ship.getGame().getShip().getLocation().distanceTo(this.dest.getLocation())) {
            return (true);
        }

        if (null != ship.dockedWith) {
            return (true);
        }

        if (this.navigateToDest(this.dest, Station.getMaxDockingSpeed() / 2)) {
            return (true)
        }

        this.matchRotation(ship, this.dest);

        return (false);
    }

    wait(date) {
        if (undefined == this.expire) {
            // Set a new expiry time
            this.expire = date + 2000 + Math.random() * 3000;
            return (false);
        }

        if (this.expire < date) {
            // Expired.
            this.expire = undefined;
            return (true);
        }
        return (false);
    }

    undock(date) {
        this.myShip.undock();
        return (true);
    }

    destruct(date) {
        this.myShip.destruct();
        return (true);
    }

    // Attack an Item
    attack(dest, date) {
        let ship = this.myShip;

        let range = ship.getLocation().distanceTo(dest.getLocation());

        // If too far away navigate towards.
        if (range > MAX_FIRE_RANGE) {
            return (this.navigateThroughDest(dest));
        } else {
            // If necessry get closer. Do not change firing angle.
            // ToDo : Not quite right. But shoud cause some interesting behaviour.
            if (range > FIRE_RANGE) {
                ship.accelerate();
            } else {
                ship.decelerate();
            }
        }

        // Close enough. Calculate lead direction.
        let delta = ship.getLocation().getRelative(dest.getLocation()).normalize();

        let destDir = dest.speed.clone().normalize();
        let missileSpeed = 600;
        missileSpeed += ship.getSpeed();
        destDir.multiplyScalar(dest.getSpeed() / missileSpeed);

        delta.add(destDir);
        delta.add(ship.getLocation());

        // Rotate towards lead.
        let angle = this.rotateTowardsLoc(delta, false);

        // If close enough fire.
        if (angle < MAX_FIRE_ANGLE) {
            if ((undefined == this.expire) || (this.expire < date)) {
                if ((dest instanceof PlayerShip) && ship.getGame().isSafe()) {
                    // Play nicely.
                    return (true);
                }
                ship.shoot(date);

                // Set a new expiry time 
                this.expire = date
                if (dest instanceof PlayerShip) {
                    this.expire += (FIRE_FREQ * (1 + Math.random() * 2));
                }
            }
        }

        // If target destroyed we are done.
        if (dest.isDestructed()) {
            this.expire = undefined;
            return (true);
        }

        return (false);
    }

    // Is current destination set and still valid?
    haveDest() {
        if (this.dest == undefined) {
            return (false);
        }

        if ((this.dest instanceof Item) && (this.dest.isDestructed())) {
            // It's gone
            return (false);
        }

        return (true);
    }

    // Rest are implementarions of the individual animate fucntions..
    navigateTo(dest, maxSpeed) {
        if (undefined == dest) {
            // Cant navigate to an undefined ... give up.
            return (true);
        }

        // We know what where we want to go.
        // Let individual AI decide how to get there.
        return (this.navigateToDest(dest, maxSpeed));
    }

    navigateThrough(dest, maxSpeed) {
        if (undefined == dest) {
            // Cant navigate to an undefined ... give up.
            return (true);
        }

        // We know what where we want to go.
        // Let individual AI decide how to get there.
        return (this.navigateThroughDest(dest, maxSpeed));
    }


    // Match rotation with anther Item.
    // Station bay is on the -x side. So actually rotating in the same direction.
    // Return true if matched.
    matchRotation(ship, dest) {
        // Due to rest of code X axes should be roughly aligned.
        let rot = ship.getRelXAngle(dest);

        // If close don't rotate.
        if (Math.abs(rot) > 0.1) {
            // +ive radians = counter clockwise.
            if (rot > 0) {
                ship.rollL();
            } else {
                ship.rollR();
            }
            return (false);
        } else {
            ship.rollRate.zero();
        }
        return (true);
    }

    // Navigate to a destination. Stop on arrival.
    // Return 'true' om arrival.
    navigateToDest(dest, maxSpeed) {
        if (dest instanceof Item) {
            if (dest.isDestructed()) {
                // It's gone
                return (true)
            }
        }

        let loc = this.getTargetLocation(dest);
        return (this.navigateToLoc(loc, true, maxSpeed));
    }

    // Navigate to a destination. Do not stop on arrival.
    // Return 'true' om arrival.
    navigateThroughDest(dest, maxSpeed) {
        if (dest instanceof Item) {
            if (dest.isDestructed()) {
                // It's gone
                return (true)
            }
        }

        let loc = this.getTargetLocation(dest);
        return (this.navigateToLoc(loc, false, maxSpeed));
    }

    // Get 'location' we want to get to for a 'destination'.
    // i.e. It's true location mofified by it's speed and our speed.
    getTargetLocation(dest) {
        let loc;
        if (dest instanceof Item) {
            loc = dest.getLocation().clone();
            loc.add(dest.speed);
        } else {
            loc = dest.clone();
        }

        loc.sub(this.myShip.speed);

        return (loc);
    }

    // Navigate to a location. 
    // Return 'true' on arrival.
    navigateToLoc(loc, stop, maxSpeed) {

        // Orient ship towards
        let dist = this.myShip.getLocation().distanceTo(loc);
        if (this.rotateTowardsLoc(loc, true) < MAX_THRUST_ANGLE) {
            // If in forward arc thust.
            if (!stop || (dist > this.myShip.getSpeed() * 5)) {
                // Thrust even when we get there.
                if (this.myShip.getFwdSpeed() < (this.myShip.getMaxSpeed() * 0.9)) {
                    this.myShip.accelerate()
                } else {
                    this.myShip.hull.setFlameState(false);
                }
            } else {
                if (undefined == maxSpeed) {
                    maxSpeed = 10;
                }

                // Try to slow down.
                if (this.myShip.getSpeed() < maxSpeed) {
                    this.myShip.accelerate()
                } else {
                    this.myShip.decelerate();
                }
            }
        } else {
            this.myShip.decelerate();
        }

        let done = Math.abs(dist) < 1;
        return (done);
    }

    // Rotate towards world location.
    // Return new angle to location.
    rotateTowardsLoc(loc, damp) {
        // Work out delta in ship space.
        let delta = this.myShip.getShortestVec(loc);
        this.myShip.worldToLocal(delta);

        this.rotateTowardsVector(delta, damp);

        return (this.myShip.angleTo(loc));
    }

    // Rotate towards a vector
    // Return true if rotated.
    // damp set to true if a 'dead zone' is required when roughly aligned.
    rotateTowardsVector(delta, damp) {
        let ship = this.myShip;
        let rotated = false;

        let xVec = new THREE.Vector2(1, 0);

        // Work out required angle adjustments.
        let yawDelta = new THREE.Vector2(delta.x, delta.y);
        yawDelta = yawDelta.angleTo(xVec);
        if (0 > delta.y) {
            yawDelta = -yawDelta;
        }

        let pitchDelta = new THREE.Vector2(delta.x, delta.z);
        pitchDelta = pitchDelta.angleTo(xVec);
        // Don't know why this is wrong way up.
        if (0 < delta.z) {
            pitchDelta = -pitchDelta;
        }

        // If it's in the rear arc ignore damping
        let threshold = THRESHOLD;
        if (delta.x < 0) {
            threshold = 0;
        }

        // Work out if we are going to get there or not with current rotate rates.
        if (!damp || (Math.abs(yawDelta) > threshold)) {
            rotated = true;
            let yr = ship.yawRate.getRate();
            let yawEst = this.myShip.getGame().getAnimateRate() * (yr * yr) / (ship.yawRate.getDelta() * 2);
            if (0 > yr) {
                yawEst = -yawEst;
            }
            if (yawEst < yawDelta) {
                this.myShip.yawL();
            } else {
                this.myShip.yawR();
            }
        }

        if (!damp || (Math.abs(pitchDelta) > threshold)) {
            rotated = true;
            let pr = ship.pitchRate.getRate();
            let pitchEst = this.myShip.getGame().getAnimateRate() * (pr * pr) / (ship.pitchRate.getDelta() * 2);
            if (0 > pr) {
                pitchEst = -pitchEst;
            }
            if (pitchEst > pitchDelta) {
                this.myShip.climb();
            } else {
                this.myShip.dive();
            }
        }

        return (rotated);
    }

    isHostile() {
        return (this.hostile)
    }

    setHostile(hostile) {
        if (this.hostile != hostile) {
            // Start from beginning of new program.
            this.pc = 0;
        }
        this.hostile = hostile;
    }
}

export { BasicAI };