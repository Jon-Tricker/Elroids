// In game 'Objects'. But the word 'Object' is overloaded ... so call them 'Items'.

// Copyright (C) Jon Tricker 2023, 2024, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import BugError from "../Game/bugError.js";
import Utils from '../Game/Utils/utilities.js';

const COLOUR = "#FFFFFF";

// Distance for audio volume to half
const AUDIO_HALF_DIST = 500;

// Items we could collide with.
class CollideItem {
    item;
    dist;

    constructor(item, dist) {
        this.item = item;
        this.dist = dist;
    }

    getDist() {
        return (this.dist);
    }

    getItem() {
        return (this.item);
    }
}

class Item extends THREE.Group {

    speed;              // m/s
    speedFrame;         // m/frame

    // Location in the system. This remains current even if docked with something.
    location;

    originalMaterial;
    mass;               // tonnes
    hitPoints;
    owner;

    // Maximum dimension size for initial collision detection.
    size;               // m

    // PositionalAudio objects for this Item. 
    // Create and attch once when first used.
    sounds = new Map();

    // Set if can't be moved.
    // Can still rotate.
    immobile = false;

    // Set if docked with something.
    dockedWith = null;

    // Array of Items in direction of travel that we could collide with.
    collideList = undefined;

    // Graphics mesh
    mesh = new THREE.Group();

    // Construct with optional mass
    constructor(location, speed, size, mass, hitPoints, owner, immobile) {
        super();
        this.location = location.clone();

        if (undefined == speed) {
            speed = new THREE.Vector3();
        }
        this.setSpeed(speed);

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

        // Add self to system
        location.system.addItem(this);

        // If this system is active add item to the graphics scene.
        if (location.system == this.getGame().universe.system) {
            this.getGame().getScene().add(this);
        }

        // Deal with situation where Item created inside another Item.
        for (let that of this.location.system.items) {
            if (this.intersects(that)) {
                this.separateFrom(that);
            }
        }
    }

    // Returns true if this intersects with that.
    intersects(that) {
        // Don't interect with self.
        if (that == this) {
            return (false);
        }

        // Fast, crude, check based on size.
        if (this.location.distanceTo(that.getLocation()) <= (this.size + that.getSize())) {
            return (true);
        }

        return (false);

        // ToDo: Possibly more detaled check based on shape.
        // Possibly use this.isPointInside()
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

    // By default just add/remove from scene.
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

    getSpeed() {
        return (this.speed.length());
    }

    getDockedWith() {
        return (this.dockedWith);
    }

    getSize() {
        return (this.size);
    }

    // Move item between systems.
    setSystem(newSystem) {
        // If already in a system remove it.
        if (null != this.location.system) {
            this.location.system.removeItem(this);
        }

        // Add it to new system
        newSystem.addItem(this);
        this.location.setSystem(newSystem);
    }

    getUniverse() {
        return (this.getSystem().universe);
    }

    getGame() {
        return (this.getSystem().getGame());
    }

    getShip() {
        return (this.getUniverse().ship);
    }

    getSystem() {
        return (this.location.system);
    }

    getLocation() {
        return (this.location);
    }

    // Normally the class name but in some cases has to be overridden.
    getName() {
        return (this.constructor.name);
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

    setLocation(loc) {
        this.location = loc.clone();
    }

    getRadarColour() {
        return (COLOUR);
    }

    destruct() {
        this.hitPoints = 0;
        this.location.system.removeItem(this);
        // If this system is active remove item from the graphics scene.
        if (this.location.system == this.getGame().universe.system) {
            this.getGame().getScene().remove(this);
        }
    }

    isDestructed() {
        return (this.hitPoints == 0);
    }

    // Push item. Thrust in kN, mass in Tonnes. This should work without scaling.
    thrust(thrust, direction, maxspeed) {
        let accRate = thrust / this.getTotalMass();
        direction.normalize();

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

    // Take damage to self.
    // Return 'true' if destroyed.
    takeDamage(hits, that) {
        this.hitPoints -= hits;
        if (this.hitPoints <= 0) {
            this.destruct();
            return (true);
        }
        return (false);
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

    // Move item in universal space.
    // Optinally detect collisions.
    moveItem(detect) {

        if (detect) {
            this.detectCollisions();
        }

        if (!this.immobile) {

            let loc = this.getLocation();
            loc.addVectors(loc, this.speedFrame);
            this.setLocation(loc);
        }
    }

    // Detects if a colisions will occur in next move.
    //
    // Return true if hit something.
    detectCollisions() {
        if ((undefined != this.collideList) && (this.collideList.length > 0) && (this.collideList[0].getDist() < this.speedFrame.length())) {
            this.handleCollision(this.collideList[0].getItem());

            // Only collide with one thing per frame.
            return (true);
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

        // Move Item centers apart.
        let reqdDelta = this.getSize() + that.getSize() + 1;
        let move = that.location.getRelative(this.location);
        reqdDelta -= move.length();
        if (1 >= reqdDelta) {
            // Already separated.
            return;
        }

        // Work out which object is faster.
        let speedDiff = this.speed.clone();
        speedDiff.sub(that.speed)

        // If there is already a delta just extend it.
        if (0 == move.length()) {
            if (0 != speedDiff.length()) {
                // Fall back on moving the faster object.
                move = speedDiff;
            } else {
                // As a last resort a random move.
                move = Utils.createRandomVector(1)
            }
        }

        // Dont know the mass yet. So move both by same amount.
        let thisMove = move;

        move.normalize();
        move.multiplyScalar(reqdDelta);

        // Move that opposite direction.
        let thatMove = move.clone();
        thatMove.multiplyScalar(-1);

        if (that.immobile) {
            thatMove = new THREE.Vector3();
        } else {
            thisMove.divideScalar(2);  
        }
        
        if (this.immobile) {
            thisMove = new THREE.Vector3();
        } else {
            thatMove.divideScalar(2);
        }

        let newLoc = this.getLocation().clone();
        newLoc.add(thisMove);
        this.setLocation(newLoc); 
        
        newLoc = that.getLocation().clone();
        newLoc.add(thatMove);
        that.setLocation(newLoc);
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

    // Move mesh in graphics space. Will be relative to ship position.
    moveMesh() {

        let camera = this.getGame().getScene().getCamera();
        if (camera.getIsFixedLocation()) {
            // Just plot it at it's location
            let loc = this.getLocation();
            this.position.set(loc.x, loc.y, loc.z);
        } else {
            // Get position relative to camers       
            let cameraPos = new THREE.Vector3();
            camera.getWorldPosition(cameraPos);
            let relPos = this.location.getRelative(cameraPos);
            relPos.multiplyScalar(-1);

            // If docked. Position relative to parent.
            if (null != this.dockedWith) {
                relPos.sub(this.dockedWith.location);
            }

            // Do non-wraping add for positions.
            relPos.add(cameraPos, false);

            this.position.set(relPos.x, relPos.y, relPos.z);
        }
    }

    setupMesh() {
        console.log("Item had no setupMesh() override. Probably a bug");
    }

    animate() {
        // Draw at current, possibly starting, position.
        // If still exists after move will be drawn there on next frame.
        this.moveMesh();

        // Update collide list
        this.genCollideList();
        this.moveItem(true);
    }

    // Builds a list of Items in the direction of travel that we may collide with.
    genCollideList() {
        // Static things don't collide.
        if (0 == this.getSpeed()) {
            this.collideList = new Array();
            return;
        }

        this.collideList = this.genPathList(this.speedFrame);
    }

    // Builds a list of Items in a sepcific direction from this that we may collide with. List is ordered by distance from this.
    //
    // Collides if a cylinder, described by our size over the width of the System, intersects with the target size.
    //
    // Also build a list of Items directly ahead. That should really be in a superclass handled by 'Ship' which has a concept of 'Ahead'.
    //
    // This cheap 'aproximate' detection. If true, and in cases where it matters, a more expensive check will be done using ray tracing.
    genPathList(path) {
        let list = new Array();

        // Search for collisions up to half the system size away.
        let rod = path.clone();
        rod.normalize();
        rod.multiplyScalar(this.location.system.getSize());
        let move = new THREE.Line3(new THREE.Vector3(), rod);

        for (let that of this.location.system.items) {

            let relLocation = that.getLocation().clone();
            relLocation.sub(this.location);

            // For the ship be generous ... has to go through windscreen.
            let minDist = 0;
            if (this.isShip()) {
                minDist += this.getSize() / 4;
            } else {
                minDist += this.getSize();
            }

            if (that.isShip()) {
                minDist += that.getSize() / 4;
            } else {
                minDist += that.getSize();
            }


            // This would be a load of math ... however threeJS does it for us.
            let closestPoint = new THREE.Vector3(0, 0, 0);
            move.closestPointToPoint(relLocation, true, closestPoint);
            let dist = closestPoint.distanceTo(relLocation);

            if (dist <= minDist) {
                // Don't collide with self.
                if (this != that) {
                    // Don't collide with docked items.
                    if (null == that.getDockedWith()) {
                        let thatDist = this.location.distanceTo(that.location) - minDist;

                        // Skip closer things.
                        let index = 0;
                        for (let elem of list) {
                            if (elem.getDist() > thatDist) {
                                break;
                            }
                            index++;
                        }

                        // Insert into array.
                        let item = new CollideItem(that, thatDist);
                        list.splice(index, 0, item);
                    }
                }
            }
        }
        return (list);
    }

    getCollideList() {
        return (this.collideList);
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
        let rel = this.location.getRelative(this.getShip().location);
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

    // Get the relative X rotation of another Item.
    // 
    // Doc says you can get local X angles as item.rotation.x.
    // Howver this does not seem to work. All 3 rotation indexes change when rotateX() is called.
    // Not even sure 'relative X rotation' means much in two seperate local coordinate system.
    //
    // So, after a days hacking, I cooked my own. 
    //
    // This assumes X axes are roughly alligned.
    getRelXAngle(that) {

        // Create Z axis vector in 'that' space.
        let v = new THREE.Vector3(0, 0, 1);

        // Convert to global space.
        v = that.localToWorld(v);

        // Subtract location difference. i.e make vector relative to 'this'.
        let diff = that.location.clone();
        diff.sub(this.location);
        v.sub(diff);

        // Convert into this space.
        v = this.worldToLocal(v);

        // Angle is angle between the vector and 'this' z axis.
        // Should rotate the vector in the direction of x=0. 
        // However Since x axes are roughly aligned just dont use x.
        let angle = Math.atan2(v.y, v.z);

        return (angle);
    }
}

export default Item;