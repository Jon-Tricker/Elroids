// NPShip based 'New saucer'.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Utils from '../../../Game/Utils/utilities.js';
import Game from '../../../Game/game.js';
import NPShip from '../nonPlayerShip.js';
import Location from '../../../Game/Utils/location.js';
import { BasicAI } from '../basicAI.js';

const MAX_ROTATE_RATE = 2;    // r/s

class Saucer2AI extends BasicAI {

    constructor(myShip) {
        super(myShip);

        // Saucers always angry.
        this.setHostile(true);
    }

    // Rotate towards world location.
    //
    // For a saucer angle X axis at about 80 degrees to direction of travel.
    //
    // Return new angle to location.
    rotateTowardsLoc(loc, damp) {
        let angle = Math.PI/2;

        // Work out delta in ship space.
        let delta = this.myShip.getShortestVec(loc);
        
        this.myShip.worldToLocal(delta);

        // Work out a vector 80 degree rotated (towards X axis) from delta.
        // What we want is delta.rotateTowards(). But this appears deprecated.
        // Following was found on line and seems to do it.
        let v1 = new THREE.Vector3(1, 0, 0).normalize();
        let v2 = delta.clone();
        v2.normalize();
        let q1 = new THREE.Quaternion();
        let q2 = new THREE.Quaternion().setFromUnitVectors(v2, v1);
        // Rotate from q1 towards q2 by a max step of 0.1 radians
        q1.rotateTowards(q2, angle);

        delta.applyQuaternion(q1);

        this.rotateTowardsVector(delta, damp);

        return (this.myShip.angleTo(loc) - angle);
    }
}

class Saucer2 extends NPShip {

    constructor(size, location, speed) {
        super(size, size, size, location, speed, 1);

        // Really don't want to pass this through the Ship herarchy when other Ships don't auto rotate.
        this.rotationRate = new THREE.Vector3(Math.random() * MAX_ROTATE_RATE * 2 - MAX_ROTATE_RATE, 0, 0);
    }   
    
    getGunPoint(dir) {
        // A point in the direction of fire.
        let point = new THREE.Vector3();

        this.localToWorld(point);
        
        // Move to a point outside ship in direction of fire.
        let delta = dir.clone().normalize();
        delta.multiplyScalar(this.length + 1);
        point.add(delta);

        let loc = new Location(undefined, point.x, point.y, point.z, this.location.system);

        return (loc);
    }  

    // For a saucer thrust towards target.
    getThrustVec() {
        let delta = this.getLocation().getRelative(this.ai.getTargetLocation(this.ai.dest)).normalize();
        return(delta);
    }

    takeDamage(hits, that) {
        if (that.owner == this.getShip()) {
            // Now it's war!
            Game.getGame().setSafe(false);
            this.setHostile(true);
        }

        let destroyed = super.takeDamage(hits, that);

        return (destroyed);
    }

    getRadarColour() {
        return ("#00D0D0");
    } 
    
    // Self destruct.
    // TODO ... fix limited weapon fire rate.
    explode(date) {
        // Make fragments
        let count = 100; //Math.ceil(Math.random() * 100);
        for (let i = 0; i < count; i++) {
            let dir = Utils.createRandomVector(1);
            this.shoot(date, dir);
        }

        // Blow up.
        this.destruct(false);
    }
}

export { Saucer2AI, Saucer2 };