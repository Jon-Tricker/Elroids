// In game 'Objects'. But the word 'Object' is overloaded ... so call them 'Items'.

// Copyright (C) Jon Tricker 2023, 2024.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Universe from '../universe.js';
import ItemBoundary from './itemBoundary.js';
import BugError from "../GameErrors/bugError.js";
import MyScene from '../Scenery/myScene.js';

const COLOUR = "#FFFFFF";

// Distance for audio volume to half
const AUDIO_HALF_DIST = 500;

class Item extends THREE.Group {

    speed;              // m/s
    speedFrame;         // m/frame

    location;
    originalMaterial;
    system;
    mass;               // tonnes
    hitPoints;
    owner;

    // Some sort of 'size' indicating average 'radius'.
    size;               // m

    // Bounding volume for collision detectionn.
    boundary = null;

    // PositionalAudio objects for this Item. 
    // Create and attch once when first used.
    sounds = new Map();

    // Set if can't be moved.
    // Can still rotate.
    immobile = false;

    // Construct with optional mass
    constructor(system, locationX, locationY, locationZ, speedX, speedY, speedZ, size, mass, hitPoints, owner, immobile) {
        super();
        this.system = system;
        this.location = new THREE.Vector3(locationX, locationY, locationZ);
        this.setSpeed(new THREE.Vector3(speedX, speedY, speedZ));
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

        if (immobile !== undefined) {
            this.immobile = immobile;
        }

        // Set default boundary
        this.setBoundary(size);

        // Add self to system
        system.addItem(this);

        // If this system is active add item to the graphics scene.
        if (system == this.getGame().universe.system) {
            this.getGame().getScene().add(this);
        }

        // Deal with situation where Item created inside another Item.
        if (null != this.getBoundary()) {
            for (let that of this.system.items) {
                if (that != this) {
                    if (null != that.getBoundary()) {
                        if (this.getBoundary().intersects(that.getBoundary())) {
                            this.separateFrom(that);
                        }
                    }
                }
            }
        }
    }

    // Stuff saved to all items.
    toJSON() {
        return {
            location: this.location,
            rotationx: this.rotation.x.toFixed(4),
            rotationy: this.rotation.y.toFixed(4),
            rotationz: this.rotation.z.toFixed(4)
        };
    }

    // By default jus add/remove from scene.
    // Override in Items that support (in)activate when not in use. 
    setActive(state) {
        let scene = this.getGame().getScene();
        if (state) {
            scene.add(this);
        } else {
            scene.remove(this);
        }
    }

    // Work round for circular dependency with Ship class.
    isShip() {
        return (false);
    }

    getId() {
        return (undefined);
    }

    // Move item between systems.
    setSystem(newSystem) {
        // If already in a system remove it.
        if (null != this.system) {
            this.system.removeItem(this);
        }

        // Add it to new system
        newSystem.addItem(this);
        this.system = newSystem;
    }

    getUniverse() {
        return (this.system.universe);
    }

    getClass() {
        return (null);
    }

    // Get boundary.
    getBoundary() {
        return (this.boundary)
    }

    setBoundary(size) {
        this.boundary = new ItemBoundary(this.location, size);
    }

    getGame() {
        return (this.system.getGame());
    }

    getShip() {
        return (this.system.universe.ship);
    }

    // Set speed/
    // Do frame rate division only one.
    setSpeed(speed) {
        if (!this.immobile) {
            if (speed.length() > 5000) {
                throw (new BugError("Something too fast " + speed.length()));
            }
            this.speed = speed.clone();
            this.speedFrame = speed.clone().divideScalar(this.getGame().getAnimateRate())
        }
    }

    getLocation() {
        return (this.location);
    }

    getRadarColour() {
        return (COLOUR);
    }

    destruct() {
        this.hitPoints = 0;
        this.system.removeItem(this);
        // If this system is active remove item from the graphics scene.
        if (this.system == this.getGame().universe.system) {
            this.getGame().getScene().remove(this);
        }
    }

    // Push item. Thrust in kN, mass in Tonnes. This should work without scaling.
    thrust(thrust, direction, maxspeed) {
        let accRate = thrust / this.getTotalMass();
        direction = direction.normalize();

        let newSpeed = this.speed.clone();
        newSpeed.addScaledVector(direction, accRate / this.getGame().getAnimateRate());

        if (newSpeed.length() > maxspeed) {
            newSpeed = newSpeed.normalize().multiplyScalar(maxspeed);
        }

        this.setSpeed(newSpeed);
    }

    // Do damage to 'that' (default zero but at least tell 'that' that it's been hit).
    doDamage(that) {
        that.takeDamage(0, this);
    }

    // Get base, unladen, mass.
    getMass() {
        return (this.mass);
    }

    // Get mass including any contents.
    getTotalMass() {
        return (this.mass);
    }

    // Damage (HP) when ramming.
    getRamDamage() {
        return (Math.ceil(this.speed.length() * this.getTotalMass() / 1000));
    }

    // Move item in universal space, Handle wrap round.
    // Optinally detect collisions.
    moveItem(detect) {

        if (detect) {
            this.detectCollisions();
        }

        if (!this.immobile) {

            this.location.addVectors(this.location, this.speedFrame);

            // Move boundary object.
            this.boundary.moveTo(this.location);

            this.getUniverse().handleWrap(this.location);
        }
    }

    // Detects if a colisions will occur in next move.
    //
    // Return true if hit something.
    // 
    // Collides if a cylinder, described by our boundary over the next move, intersects with the target.
    // Fortunatly this can be handled by determining if the vector of the next move is closer to the targets location than the sum of the radii.
    //
    // This cheap 'aproximate' detection. If true, and in cases where it matters, a more expensive check will be done using ray tracing.
    detectCollisions() {
        // Things that don't move don't hit things
        if (0 == this.speed.length()) {
            return (false);
        }

        let thisBoundary = this.getBoundary();

        if (null == thisBoundary) {
            // Not checking collisions
            return;
        }

        // Create line for move.
        let move = new THREE.Line3(Universe.originVector, this.speedFrame);

        for (let that of this.system.items) {

            let thatBoundary = that.getBoundary();

            if (null != thatBoundary) {

                let relLocation = that.location.clone();
                relLocation.sub(this.location);
                this.getUniverse().handleWrap(relLocation);

                // For the ship be generous ... has to go through windscreen.
                let minDist = 0;
                if (this.isShip()) {
                    // console.log("X " + thisBoundary.getSize() + " " + thatBoundary.getSize())
                    minDist += thisBoundary.getSize() / 4;
                } else {
                    minDist += thisBoundary.getSize();
                }

                if (that.isShip()) {
                    minDist += thatBoundary.getSize() / 4;
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
                        if (this.handleCollision(that)) {
                            // Only collide with one thing per frame.
                            return (true);
                        }
                    }
                }
            }
        }
        return (false);
    }

    // Accurate detection of if a point is inside our mesh.
    //
    // Returns first mech encountered or null.
    // 
    // Expensive so only use once detectCollisions() has indicated that we are resonably close.
    //
    // Does a line from the point to outside intersect with our mesh and odd number of times?
    //
    // FOR THIS TO WORK ALL MATERIALS USED IN 'this' MUST BE DOUBLE SIDED (side: THREE.DoubleSide)
    isPointInside(point) {
        let raycaster = new THREE.Raycaster()

        // A ray from ship and a bit longer than station diameter.
        // Otherwise may not come out the other side.
        raycaster.set(point, new THREE.Vector3(this.size * 10, this.size * 10, this.size * 10))

        let intersects = raycaster.intersectObject(this);

        if (intersects.length % 2 === 1) {
            return (intersects[0].object);
        } else {
            return (null);
        }
    }

    // Separate two overlapping objects.
    separateFrom(that) {

        if (this.immobile && that.immobile) {
            throw new BugError("Two immobile Items cannot collide.")
        }

        // Work out how much we need to move things by.
        let reqdDelta = (this.getBoundary().getSize() + that.getBoundary().getSize()) * 1.1;
        if (0 >= reqdDelta) {
            // Already separated.
            return;
        }

        // Make sure speeds differ
        /*
        let spd = this.speed.clone();
        spd.sub(that.speed);
        if (1 > spd.length()) {
            spd = this.speed.clone();
            spd.add(new THREE.Vector3(1, 1, 1));
            this.setSpeed(spd);

            spd = that.speed.clone();
            spd.add(new THREE.Vector3(-1, -1, -1));
            that.setSpeed(spd);
        }
        */

        // Work out which object is faster.
        let faster;
        if (this.immobile) {
            faster = that;
        } else {
            if (that.immobile) {
                faster = this;
            } else {
                if (this.speed.length() > that.speed.length()) {
                    faster = this;
                } else {
                    faster = that;
                }
            }
        }

        let slower = that;
        if (faster == that) {
            slower = this;
        }

        // Move the faster object.

        // Move outside requiredDelta.
        let move = faster.speed.clone();

        // If even 'faster' not moving.
        if (0 == move.length()) {
            // Move relative to current position.
            move = slower.getRelativeLocation(faster.location);
            if (0 == move.length()) {
                // If at same location make random  move.
                move = this.getGame().createRandomVector(1);
            }
        }

        move.normalize();
        move.multiplyScalar(reqdDelta);
        faster.location = slower.location.clone();
        faster.location.add(move);

        /*
        console.log("After this " + this.position.x + " " + this.position.y + " " + this.position.z + " " + this.location.x + " " + this.location.y + " " + this.location.z);
        console.log("After that " + that.position.x + " " + that.position.y + " " + that.position.z + " " + that.location.x + " " + that.location.y + " " + that.location.z);
        console.log("After camera " + camera.position.x + " " + camera.position.y + " " + camera.position.z);
        */
    }

    // Handle collision physics
    // Since we already have everything as x,y,z components hopefully can avoid any messy 'trig'.
    // Return true if actually collided.
    handleCollision(that) {
        this.transferMomentum(that);

        // If overlapping separate ... even if one of us is about to be destroyed.
        this.separateFrom(that);

        // Do any damage
        this.collideWith(that);

        return (true);
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

    // Move mesh in graphics space. Will be relative to ship position.
    moveMesh() {

        let camera = this.getGame().getScene().getCamera();
        if (camera.getIsFixedLocation()) {
            // Just plot it at it's location
            this.position.set(this.location.x, this.location.y, this.location.z);
        } else {
            // Get position relative to camers       
            let cameraPos = new THREE.Vector3();
            camera.getWorldPosition(cameraPos);
            let relPos = this.getRelativeLocation(cameraPos);
            relPos.multiplyScalar(-1);
            this.position.set(relPos.x + cameraPos.x, relPos.y + cameraPos.y, relPos.z + cameraPos.z);
        }
    }

    // Get position relative to something else.
    // Handle seeing Items > Universe size away.
    getRelativeLocation(loc) {
        let rel = loc.clone();
        rel.sub(this.location);

        this.getUniverse().handleWrap(rel);
        return (rel);
    }

    setupMesh() {
        console.log("Item had no setupMesh() override. Probably a bug");
    }

    animate() {
        console.log("Item had no animate() override. Probably a bug");
    }

    // Play a sound optional volume (0 - 1) and loop if it is to repeat.
    // Return true if we could do what the game requires.
    //
    // 3D location should be from the Item. However I could not get positional listeners to work.
    // So for now simple 'mono' with volume reduced by distance.
    playSound(name, volume, loop) {
        if (!this.getGame().soundOn) {
            return (false);
        }

        let list = this.getGame().getListener();
        if ((undefined == list)) {
            // Dont have a listener yet ... give up. without loading
            return (false);
        }


        // We are going to play a sound. Get the buffer.
        let sound = this.sounds.get(name);
        if (undefined == sound) {
            // Need to create/attach PositionalAudio for this Item.
            let buffer = this.getGame().getSounds().get(name);
            if (null == buffer) {
                // Buffer not yet loaded into Univese
                return (false);
            }

            sound = new THREE.Audio(list);
            sound.setBuffer(buffer);
            sound.stop();

            this.sounds.set(name, sound);
        }

        if (undefined == volume) {
            volume = 1;
        }

        // Fiddle volume to fall off with distance.
        //
        // Tried for age to get PositionalAudio working but it seems to have problems ... just won't move with the camera.
        // This hack gives voulme reduction but no directionality.
        //
        // ToDo : Fix back to PositionalAudio.

        // Probably want to hear it as if on the ship even if the camera is elsewhere.
        let rel = this.getRelativeLocation(this.getShip().location);
        let dist = rel.length();
        volume = volume / (2 ** (dist / AUDIO_HALF_DIST));
        if (volume < 0.01) {
            // Too quiet
            return (true);
        }

        sound.setVolume(volume);

        if (undefined != loop) {
            sound.setLoop(loop);
        }

        // Play it
        if (!sound.isPlaying) {
            sound.play();
        }

        return (true)
    }

    stopSound(name) {
        let sound = this.sounds.get(name);
        if (undefined != sound) {
            sound.stop();
        }
    }
}

export default Item;