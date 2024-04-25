// In game 'Objects'. But the word 'Object' is overloaded ... so call them 'Items'.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Universe from '../universe.js';
import ItemBoundary from './itemBoundary.js';
import BugError from "../GameErrors/bugError.js"
import Ship from "../Ship/ship.js"

const COLOUR = "#FFFFFF"

class Item extends THREE.Group {

    speed;              // m/s
    speedFrame;         // m/frame

    location;
    originalMaterial;
    game;
    mass;               // tonnes
    hitPoints;
    owner;

    // Some sort of 'size' indicating average 'radius'.
    size;               // m

    // Bounding volume for collision detectionn.
    boundary = null;

    // Construct with optional mass
    constructor(locationX, locationY, locationZ, speedX, speedY, speedZ, game, size, mass, hitPoints, owner) {
        super();
        this.location = new THREE.Vector3(locationX, locationY, locationZ);
        this.setSpeed(new THREE.Vector3(speedX, speedY, speedZ));
        this.game = game;
        this.size = size;
        this.owner = owner;


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

        // Set default boundary
        this.setBoundary(size);

        // Add self to the game universe
        Universe.addItem(this);

        // Add self to graphics scene.
        game.getScene().add(this);
    }

    getClass() {
        return(null);
    }

    // Get boundary.
    getBoundary() {
        return (this.boundary)
    }

    setBoundary(size) {
        this.boundary = new ItemBoundary(this.location, size);
    }

    // Set speed/
    // Do frame rate division only one.
    setSpeed(speed) {
        if (speed.length() > 5000) {
            throw (new BugError("Something too fast " + speed.length()));
        }
        this.speed = speed.clone();
        this.speedFrame = speed.clone().divideScalar(Universe.getAnimateRate())
    }

    getLocation() {
        return (this.location);
    }

    getRadarColour() {
        return (COLOUR);
    }

    destruct() {
        this.hitPoints = 0;
        Universe.removeItem(this);
        this.game.getScene().remove(this);
    }

    // Push item. Thrust in kN, mass in Tonnes. This should work without scaling.
    thrust(thrust, direction, maxspeed) {
        let accRate = thrust / this.getMass();
        direction = direction.normalize();

        let newSpeed = this.speed.clone();
        newSpeed.addScaledVector(direction, accRate / Universe.getAnimateRate());

        if (newSpeed.length() > maxspeed) {
            newSpeed = newSpeed.normalize().multiplyScalar(maxspeed);
        }

        this.setSpeed(newSpeed);
    }

    // Do damage to 'that' (default zero but at least tell 'that' that it's been hit).
    doDamage(that) {
        that.takeDamage(0, this);
    }

    getMass() {
        return (this.mass);
    }

    // Move item in universal space, Handle wrap round.
    // Optinally detect collisions.
    moveItem(detect) {

        if (detect) {
            this.detectCollisions();
        }

        this.location.addVectors(this.location, this.speedFrame);

        // Move boundary object.
        this.boundary.moveTo(this.location);

        Universe.handleWrap(this.location);
    }



    // Detects if a colisions will occur in next move.
    //
    // Return true if hit something.
    // 
    // Collides if a cylinder, described by our boundary over the next move, intersects with the target.
    // Fortunatly this can be handled by determining if the vector of the next move is closer to the targets location than the sum of the radii.
    detectCollisions() {
        // Things that don't move don't hit things
        if (0 == this.speed.length()) {
            return;
        }

        let thisBoundary = this.getBoundary();

        // Create line for move.
        let move = new THREE.Line3(Universe.originVector, this.speedFrame);

        for (let that of Universe.itemList) {

            let thatBoundary = that.getBoundary();

            if (null != thatBoundary) {

                let relLocation = that.location.clone();
                relLocation.sub(this.location);
                Universe.handleWrap(relLocation);

                // For the ship be generous ... has to go through windscreen.
                let minDist = 0;
                if (this instanceof Ship) {
                    // console.log("X " + thisBoundary.getSize() + " " + thatBoundary.getSize())
                    minDist += thisBoundary.getSize()/4;
                } else {
                    minDist += thisBoundary.getSize();
                }

                if (that instanceof Ship) {
                    minDist += thatBoundary.getSize()/4;
                } else {
                    minDist += thatBoundary.getSize();
                }

                // This would be a load of math ... however threeJS does it for us.
                let closestPoint = new THREE.Vector3(0, 0, 0);
                move.closestPointToPoint(relLocation, true, closestPoint);
                let dist = closestPoint.distanceTo(relLocation)

                if (dist <= minDist) {

                    // Don't collide with self.
                    if (this != that) {
                        this.handleCollision(that);

                        // Only collode with one thing per frame.
                        return(true);
                    }
                }
            }
        }
        return(false);
    }

    // Separate two overlapping objects.
    separateFrom(that) {
        
        let relLoc = this.getRelativePosition(that.location);
        while (0 == relLoc.length()) {
            relLoc.add(this.game.createRandomVector(1));
        }

        // Split should really be based on relative masses but use size for now.
        let totalSize = this.getBoundary().getSize() + that.getBoundary().getSize();
        if (totalSize > relLoc.length()) {

            relLoc = relLoc.normalize();
            relLoc.multiplyScalar(2);

            let delta = relLoc.clone();
            delta.multiplyScalar(this.getBoundary().getSize());
            this.location.sub(delta);

            delta = relLoc.clone();
            delta.multiplyScalar(that.getBoundary().getSize());
            that.location.add(delta)
        }
    }

    // Handle collision physics
    // SInce we already have everything as x,y,z components hopefully can avoid any messy 'trig'.
    handleCollision(that) {

        // If overlapping separate ... even if one of us is about to be destroyed.
        this.separateFrom(that);

        this.transferMomentum(that);

        // Do any damage
        this.collideWith(that);
    }

    transferMomentum(that) {
        // Handle momentum transfer.
        // Work out directions of collision
        let d1 = new THREE.Vector3(that.location.x - this.location.x, that.location.y - this.location.y, that.location.z - this.location.z);
        let d2 = new THREE.Vector3(this.location.x - that.location.x, this.location.y - that.location.y, this.location.z - that.location.z);

        // Normalize dirextionslet 
        let dmag = Math.sqrt(d1.x * d1.x + d1.y * d1.y + d1.z * d1.z);
        if (0 != dmag) {
            d1 = d1.divideScalar(dmag);
            d2 = d2.divideScalar(dmag);
        }

        // Get masses
        let m1 = this.getMass();
        let m2 = that.getMass();
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

    // Move mesh in graphics space. Will be relative to ship position.
    moveMesh() {

        let camera = this.game.getScene().getCamera();
        if (camera.getIsFixedLocation()) {
            // Just plot it at it's location
            this.position.set(this.location.x, this.location.y, this.location.z);
        } else {
            // Get position relative to camers       
            let cameraPos = new THREE.Vector3();
            camera.getWorldPosition(cameraPos);
            let relPos = this.getRelativePosition(cameraPos);   
            relPos.multiplyScalar(-1);
            this.position.set(relPos.x + cameraPos.x, relPos.y + cameraPos.y, relPos.z + cameraPos.z);
        }
    }

    // Get position relative to something else.
    // Handle seeing Items > Universe size away.
    getRelativePosition(loc) {
        let rel = loc.clone();
        rel.sub(this.location);

        Universe.handleWrap(rel);
        return (rel);
    }

    setupMesh() {
        console.log("Item had no setupMesh() override. Probably a bug");
    }

    animate() {
        console.log("Item had no animate() override. Probably a bug");
    }
}

export default Item;