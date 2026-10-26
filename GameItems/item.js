// In game 'Objects'. But the word 'Object' is overloaded ... so call them 'Items'.

// Copyright (C) Jon Tricker 2023, 2024, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';
import Game from "../Game/game.js";
import Explosion from "./explosion.js";
import ItemGraphics from "./itemGraphics.js";

class Item extends ItemGraphics {
    mass;               // tonnes
    hitPoints;
    owner;

    // Set if docked with something.
    dockedWith;

    // Construct with optional mass
    constructor(location, speed, size, mass, hitPoints, owner, immobile, rotationRate, persist) {
        super(location, speed, size, immobile, rotationRate, persist);
        if (mass === undefined) {
            this.mass = 0;
        } else {
            this.mass = mass;
        }

        if (hitPoints === undefined) {
            this.hitPoints = 1;
        } else {
            this.hitPoints = hitPoints;
        }

        if (owner === undefined) {
            this.owner = null;
        } else {
            this.owner = owner;
        }
    }

    getId() {
        return (undefined);
    }

    getDockedWith() {
        return (this.dockedWith);
    }

    // Push item. Thrust in kN, mass in Tonnes. This should work without scaling.
    thrust(thrust, direction, maxspeed) {
        let accRate = thrust / this.getTotalMass();
        direction.normalize();

        let newSpeed = this.speed.clone();
        newSpeed.addScaledVector(direction, accRate / Game.getGame().getAnimateRate());

        if (newSpeed.length() > maxspeed) {
            newSpeed = newSpeed.normalize().multiplyScalar(maxspeed);
        }

        this.setSpeed(newSpeed);
    }

    // Do damage to 'that' (default zero but at least tell 'that' that it's been hit).
    doDamage(that) {
        that.takeDamage(0, this);
    }

    // Take damage to self.
    // Return 'true' if destroyed.
    takeDamage(hits, that) {
        this.hitPoints -= hits;
        if (this.hitPoints <= 0) {
            new Explosion(this.size, this);
            this.destruct(true);
            return (true);
        }
        return (false);
    }   

    setActive(state) {
        // For non persisted Items handle just the graphics.
        super.setActive(state);
    }
    
    destruct(violent) {
        super.destruct(violent);
        this.hitPoints = 0;
        this.owner = undefined;
        this.dockedWith = undefined;
    }


    // Get base, unladen, mass.
    getMass() {
        return (this.mass);
    }

    // Most things don't have any content
    getTotalMass() {
        return (this.mass);
    }

    // Damage (HP) when ramming.
    getRamDamage() {
        return (Math.ceil(this.getSpeed() * this.getTotalMass() / 1000));
    }   
    
    // Handle collision physics
    // Since we already have everything as x,y,z components hopefully can avoid any messy 'trig'.
    // Return true if actually collided.
    handleCollision(that) {
        this.transferMomentum(that);

        // Do any damage
        this.collideWith(that);

        // If overlapping separate.
        if ((!this.isDestructed()) && (!that.isDestructed())) {
            this.separateFrom(that);
        }

        // Collide list now invalid
        this.collideList = undefined;

        return (true);
    }

    transferMomentum(that) {
        // Handle momentum transfer.
        // Work out directions of collision
        let thisLoc = this.getLocation();
        let thatLoc = that.getLocation();
        let d1 = new THREE.Vector3(thatLoc.x - thisLoc.x, thatLoc.y - thisLoc.y, thatLoc.z - thisLoc.z);
        let d2 = new THREE.Vector3(thisLoc.x - thatLoc.x, thisLoc.y - thatLoc.y, thisLoc.z - thatLoc.z);

        // Normalize dirextionslet 
        let dmag = Math.sqrt(d1.x * d1.x + d1.y * d1.y + d1.z * d1.z);
        if (0 != dmag) {
            d1 = d1.divideScalar(dmag);
            d2 = d2.divideScalar(dmag);
        }

        // Get masses
        let m1 = this.getTotalMass();
        let m2 = that.getTotalMass();
        if (0 == (m1 + m2)) {
            console.log("Cant transfer momentum between massless objects.");
        } else {

            // Work out current velocity of collision in the direction of collision.
            let u1 = this.getVelocityComponentInDirction(d1);
            let u2 = that.getVelocityComponentInDirction(d1);

            // Do the transfer of mementum calculation.
            // This from equasions on Wikipedia for a 1d collosion between masses 'm1' and 'm2'
            // with initial velocity 'u1' and 'u2' giving final velocities 'v1' and 'v2'.
            let v1 = (((m1 - m2) / (m1 + m2)) * u1) + (((2 * m2) / (m1 + m2)) * u2);
            let v2 = (((2 * m1) / (m1 + m2)) * u1) + (((m2 - m1) / (m1 + m2)) * u2);
            // console.log("before m1 " + m1 + " m2 " + m2 + " u1 " + u1 + " u2 " + u2 + " after v1 " + v1 + " v " + v2);
            // console.log("Totals were m=" + (m1 * u1 + m2 * u2) + " e=" + (m1 * u1 * u1 / 2 + m2 * u2 * u2 / 2) + " is m=" + (m1 * v1 + m2 * v2) + " e=" + (m1 * v1 * v1 / 2 + m2 * v2 * v2 / 2));

            // Apply new velocity to both items. Both results are signed relative to d1.
            this.deltaVelocityComponentInDirection(d1, v1 - u1);
            that.deltaVelocityComponentInDirection(d1, v2 - u2);
        }
    }

    collideWith(that) {
        // Things don't damage thier owners.
        if ((this.owner != that) && (that.owner != this)) {
            this.doDamage(that);
            that.doDamage(this);
        }
    }

    // Given a direction vector work out the scalar magnitude of the velocity in that direction.
    getVelocityComponentInDirction(d) {
        let u = this.speed;
        let ux = (u.x * d.x);
        let uy = (u.y * d.y);
        let uz = (u.z * d.z);

        // Get dot product.
        let s = ux + uy + uz;

        return (s);
    }

    // Given a scalar velocity and direction add it's x, y and z components to our speed.
    deltaVelocityComponentInDirection(d, v) {

        let deltav = d.clone();
        deltav.multiplyScalar(v);

        // Add new speed
        let newSpeed = this.speed.clone();
        newSpeed.add(deltav);
        this.setSpeed(newSpeed);
    }

    // Get relative value with optional weigthing for proximity.
    getRelativeValue(loc) {
        let value = this.getValue();
        if (undefined == loc) {
            return (value);
        }

        let dist = loc.getRelative(this.location).length();
        value /= (dist / 100) * this.getMass();
        return (value);
    }
}

export default Item;