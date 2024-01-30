// Common stuff, graphics and physics for every item in the universe.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Universe from '../universe.js'

const COLOUR = "#FFFFFF"

class Item extends THREE.Group {

    speed;
    location;
    originalMaterial;
    game;
    mass;
    hitPoints;
    owner;

    // Some sort of 'size' indicating average 'radius'.
    size;

    // Construct with optional mass
    constructor(locationX, locationY, locationZ, speedX, speedY, speedZ, game, size, mass, hitPoints, owner) {
        super();
        this.location = new THREE.Vector3(locationX, locationY, locationZ);
        this.speed = new THREE.Vector3(speedX, speedY, speedZ);
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

        // Add self to the game universe
        Universe.addItem(this);

        // Add self to graphics scene.
        game.getScene().add(this);
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
        this.location.addVectors(this.location, this.speed);
        Universe.handleWrap(this.location);
        if (detect) {
            this.detectCollisions();
        }
    }


    // Get the bounding box. If not overridden get the default box
    // Return 'null' if collisions with this not to be checked.
    getBoundingBox() {
        let offset = new THREE.Vector3(this.size, this.size, this.size);
        let min = new THREE.Vector3();
        min.subVectors(this.location, offset);
        let max = new THREE.Vector3();
        max.addVectors(this.location, offset);
        let box = new THREE.Box3(min, max);
        return (box);
    }

    // Detect colisions.
    // Do this in display space. Possible colisions that occur through wrap round are out of the users sight ... so ignore.
    detectCollisions() {
        /*
        for (let count = 0; count < this.children.length; count++) {
            
            let child = this.children[count];
 
            if (child == this.flameMesh) {
 
                for (var vertexIndex = 0; vertexIndex < child.geometry.attributes.position.array.length; vertexIndex++) {
                    var localVertex = new THREE.Vector3().fromBufferAttribute(child.geometry.attributes.position, vertexIndex).clone();
                    var globalVertex = localVertex.applyMatrix4(child.matrix);
                    var directionVector = globalVertex.sub(child.position);
 
                    var ray = new THREE.Raycaster(child.position, directionVector.clone().normalize());
                    var collisionResults = ray.intersectObject(meshRock);
                    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                        console.log("Crunch " + count + " " + child + " " + collisionResults[0].distance);
                        return(true);
                    }
                }
            }
        }
        return(false);
        */

        // The above ray tracin method sort of works but seems over sensitive.
        // For now do a quick and nasty aproximation.
        // TODO make boxes a bit smaller so it has to ba a solid hit.
        // TODO get above working.
        let thisBox = this.getBoundingBox();

        let collided = false;
        for (let that of Universe.itemList) {

            let thatBox = that.getBoundingBox();

            if (null != thatBox) {
                if (thisBox.intersectsBox(thatBox)) {

                    // Don't collide with self.
                    if (this != that) {
                        // Remeber we hit something/
                        collided = true;

                        this.handleCollision(that);

                    }
                }
            }
        }
    }

    // Separate two overlapping objects.
    separateFrom(that) {
        // Don't loop forever.
        let count = 1000;

        while ((this.getBoundingBox().intersectsBox(that.getBoundingBox())) && (0 < count--)) {
            if (this.speed.equals(that.speed)) {
                // Never going to separate ... fiddle something
                let delta = (Math.random() * 0.02) - 0.01;
                switch (Math.floor(Math.random() * 3)) {
                    case 0:
                        this.speed.x += delta;
                        break;
                    case 1:
                        this.speed.y += delta;
                        break;
                    case 2:
                        this.speed.z += delta;
                    default:
                }
            } else {
                this.moveItem(false);
                that.moveItem(false);
            }
        }
    }

    // Handle collision physics
    // SInce we already have everything as x,y,z components hopefully can avoid any messy 'trig'.
    handleCollision(that) {
        // Do any damage
        this.collideWith(that);

        // Check that original still exists ... if not don't transfer momemntum.
        if (0 >= this.hitPoints) {
            return;
        }

        this.transferMomentum(that);

        // If overlapping separate.
        this.separateFrom(that);
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
        if((this.owner != that) && (that.owner != this)) {
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

        let vx = v * d.x;
        let vy = v * d.y;
        let vz = v * d.z;
        let deltav = new THREE.Vector3(vx, vy, vz);

        // Add new speed
        // console.log("add before sx " + this.speed.x + " sy " + this.speed.y + " sz " + this.speed.z)
        this.speed.add(deltav);
        // console.log("add after sx " + this.speed.x + " sy " + this.speed.y + " sz " + this.speed.z)
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
            this.position.set(relPos.x + cameraPos.x, relPos.y + cameraPos.y, relPos.z + cameraPos.z);
        }
    }

    // Get position relative to something else.
    // Handle seeing Items > Universe size away.
    // ToDo - Sign on this may be wrong. However in about half the usage cases it's as needed.
    getRelativePosition(target) {
        let rel = new THREE.Vector3(this.location.x - target.x, this.location.y - target.y, this.location.z - target.z);
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