// Simple non-player ship AI.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import BugError from '../../Game/bugError.js';
import Item from '../../GameItems/item.js';
import Station from '../../GameItems/System/station.js';

// Minimum turn threshold
// Found, by experimentation, to prevent 'seeking'. 
// TODO: Someone who is better at control theory than me please fix.
const THRESHOLD = 0.1;

// Meta language instructions for ship navigation 'programs'.
class NavMode {
    name;
    maxSpeed;
    animateFn;
    getDestFn;

    // Stop
    static STOP = new NavMode("stop", this.navigateTo, this.getDestUndefined, 0);

    // Navigate to station aproach point
    static STATION_APPROACH = new NavMode("approach", this.navigateThrough, this.getDestApproachPoint, undefined);

    // Dock with station.
    static STATION_DOCK = new NavMode("dock", this.dock, this.getDestStaion, Station.getMaxDockingSpeed() / 2);

    // Undock with station.
    static UNDOCK = new NavMode("undock", this.undock, undefined, undefined);

    // Go to wormhole.
    static WORMHOLE = new NavMode("wormhole", this.navigateThrough, this.getDestWormhole, undefined);

    // Wait for a short period.
    static WAIT = new NavMode("wait", this.wait, undefined, undefined);

    // Go to a random location.
    static RANDOM = new NavMode("random", this.navigateThrough, this.getDestRandom, undefined);

    // Destroy ship
    static DESTRUCT = new NavMode("destruct", this.destruct, undefined, undefined);

    constructor(name, animateFn, getDestFn, maxSpeed) {
        this.animateFn = animateFn;
        this.getDestFn = getDestFn;
        this.name = name;
        this.maxSpeed = maxSpeed;
    }

    getMaxSpeed() {
        return (this.maxSpeed);
    }

    getNavTo() {
        return (this.navTo)
    }

    // Call an instruction.
    animate(ai, date) {
        if (undefined == this.animateFn) {
            throw (new BugError("Undefined operation in ship AI."))
        }
        return (this.animateFn.call(ai, date));
    }

    getDest(ai) {
        if (undefined == this.getDestFn) {
            return (undefined);
        }
        return (this.getDestFn.call(ai));
    }

    static getDestApproachPoint() {
        return (this.myShip.location.system.stations.values().next().value.getApproachPoint());
    }

    static getDestStaion() {
        return (this.myShip.location.system.stations.values().next().value);
    }

    static getDestWormhole() {
        return (this.myShip.location.system.wormholeEnds.values().next().value);
    }

    static getDestRandom() {
        return (this.myShip.getGame().createRandomVector(this.myShip.location.system.systemSize));
    }

    // Rest are implementarions of the individual animate fucntions..
    static navigateTo() {
        // We know what where we want to go.
        // Let individual AI decide how to get there.
        return (this.navigateToDest(this.destination));
    }

    static navigateThrough() {
        // We know what where we want to go.
        // Let individual AI decide how to get there.
        return (this.navigateThroughDest(this.destination));
    }

    static dock() {
        // If docking blocked give up.
        if (this.getShip().getLocation().distanceTo(this.destination.getLocation()) > this.getShip().getGame().getShip().getLocation().distanceTo(this.destination.getLocation())) {
            return(true);
        }

        if (null != this.myShip.dockedWith) {
            return (true);
        }
        return (this.navigateToDest(this.destination));
    }

    static undock() {
        this.myShip.undock();
        return (true);
    }

    static destruct() {
        this.myShip.destruct();
        return (true);
    }

    static wait(date) {
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
}

class BasicAI {

    // Navigation program.
    // Loops until it hits STOP.
    program = new Array(
        // NavMode.RANDOM,
        NavMode.STATION_APPROACH,
        NavMode.STATION_DOCK,
        NavMode.WAIT,
        NavMode.UNDOCK,
        NavMode.WORMHOLE,
        NavMode.STOP
    )

    // Program counter.
    pc;

    // Wait timer
    expire = undefined;

    myShip;

    // Destination may be an item or a location.
    destination = undefined;

    constructor(myShip) {
        this.myShip = myShip;
        this.pc = 0;
        this.destination = this.program[this.pc].getDest(this);
    }

    getShip() {
        return (this.myShip);
    }

    animate(date) {
        let done = this.program[this.pc].animate(this, date);

        if (done) {
            // Got there. 
            this.incPc();
            this.destination = this.program[this.pc].getDest(this);
        }
    }

    incPc() {
        this.pc++;
        if (this.pc >= this.program.length) {
            this.pc = 0;
        }
    }

    // Navigate to a destination. Stop on arrival.
    // Return 'true' om arrival.
    navigateToDest(dest) {
        if (dest instanceof Item) {
            if (dest.isDestructed()) {
                // It's gone
                return (true)
            } else {
                return (this.navigateToLoc(dest.getLocation(), true));
            }
        }
        return (this.navigateToLoc(dest, true));
    }

    // Navigate to a destination. Do not stop on arrival.
    // Return 'true' om arrival.
    navigateThroughDest(dest) {
        if (dest instanceof Item) {
            if (dest.isDestructed()) {
                // It's gone
                return (true)
            } else {
                return (this.navigateToLoc(dest.getLocation(), false));
            }
        }
        return (this.navigateToLoc(dest, false));
    }
 
    // Navigate to a location. 
    // Return 'true' on arrival.
    navigateToLoc(loc, stop) {
        let res = false;

        // Orient ship towards
        let dist = this.getShip().getLocation().distanceTo(loc);
        if (this.rotateTowardsVector(loc)) {
            // If in forward arc thust.
            if (!stop || (dist > this.myShip.getSpeed() * 5)) {
                // Thrust even when we get there.
                if (this.myShip.getSpeed() < (this.myShip.getMaxSpeed() * 0.9)) {
                    this.myShip.accelerate()
                } else {
                    this.myShip.hull.setFlameState(false);
                }
            } else {
                let maxSpeed = 10;
                if (undefined != this.program[this.pc].getMaxSpeed()) {
                    maxSpeed = this.program[this.pc].getMaxSpeed();
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

        /*
        console.log("dist " + dist + " speed " + this.myShip.getSpeed() + " stop " + stop + " maxSpeed " + this.program[this.pc].getMaxSpeed() + " dest " + loc.x + " " + loc.y + " " + loc.z + " ship loc " + 
        this.myShip.getLocation().x + " " + this.myShip.getLocation().y + " " + this.myShip.getLocation().z)
        */

        let done = Math.abs(dist) < 1;
        return (done);
    }
   
    // Get shortest vector to a location. May be through wrap round.
    getShortestVec(loc) {
        let vec = loc.clone();
        vec.sub(this.myShip.location);
        vec.add(this.myShip.location);
        return(vec);
    }
    
    // Rotate towards a relative vector.
    // Return true if in the fwd arc and angle is acceptable.
    rotateTowardsVector(loc) {
        // Work out delta in ship space.
        let delta = this.getShortestVec(loc);
        this.myShip.worldToLocal(delta);

        delta.normalize();
        let rotated = false;
        // console.log("deltas" + delta.x + " " + delta.y + " " + delta.z);

        // Work out yaw
        if (delta.y > THRESHOLD) {
            this.myShip.yawL();
            // Spaceships dont need to roll.
            // Fake something, like an aircraft, so it looks right.
            this.myShip.rollL();
            rotated = true;
        } else {
            if (delta.y < -THRESHOLD) {
                this.myShip.yawR();
                this.myShip.rollR();
                rotated = true;
            } else {
                this.myShip.yawRate = 0;
                this.myShip.rollRate = 0;
            }
        }

        // Work out pitch 
        if (delta.z > THRESHOLD) {
            this.myShip.climb();
            rotated = true;
        } else {
            if (delta.z < -THRESHOLD) {
                this.myShip.dive();
                rotated = true;
            } else {
                this.myShip.pitchRate = 0;
            }
        }

        if (stop && rotated) {
            return(false);
        }

        return (delta.x > 0);
    }
}

export default BasicAI;