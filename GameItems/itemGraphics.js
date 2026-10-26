// 'Item' graphics. 
//
// Just the graphical parts of an Item. 
// Can be displayed in the scene, moved and animated. Also has audio support.
// But has no physical 'reality'. 
// It does not interact with other Items.

// Copyright (C) Jon Tricker 2023, 2024, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Game from '../Game/game.js';
import BugError from "../Game/bugError.js";
import Utils from '../Game/Utils/utilities.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const COLOUR = "#FFFFFF";

// Distance for audio volume to half
const AUDIO_HALF_DIST = 500;

const MAX_ROTATION_RATE = 0.5;    // R/s

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

class ItemGraphics extends THREE.Group {

    // Sometimes (e.g 'Ship' which may be a persistable 'playerShip' or a non persistable 'NPShip') we need persistance to be switchable.
    // To avoid havin dupicates of all super classe (or multiple inheritance) hava an optional flag to switch it off.
    persist = false;

    speed;              // m/s
    speedFrame;         // m/frame

    // Set if can't be moved.
    // Can still rotate.
    immobile = false;

    // Location in the system. This remains current even if docked with something.
    location;

    // Maximum dimension size for initial collision detection.
    size;               // m

    // PositionalAudio objects for this Item. 
    // Create and attch once when first used.
    sounds;

    // Graphics mesh
    mesh;

    // Textual label (if any).
    label;
    labelTxt;
    labelFixed;         // If true label can't be deleted/modified.

    // Array of Items in direction of travel that we could collide with.
    collideList = undefined;

    // Construct with optional mass
    constructor(location, speed, size, immobile, rotationRate, persist) {
        super();

        this.sounds = new Map();

        this.location = location.clone();

        this.size = size;

        if (undefined == speed) {
            speed = new THREE.Vector3();
        }
        this.setSpeed(speed);

        if (undefined != persist) {
            this.persist = persist;
        }

        // Deal with situation where Item created inside another Item.
        for (let that of this.location.system.items) {
            if (this.intersects(that)) {
                this.separateFrom(that);
            }
        }

        if (Game.getGame().isSafe()) {
            this.setLabel(this.getName());
        }

        if (immobile != undefined) {
            this.immobile = immobile;
        }

        if (undefined == rotationRate) {
            this.rotationRate = new THREE.Vector3(this.generateRotationRate(), this.generateRotationRate(), this.generateRotationRate());
        } else {
            this.rotationRate = rotationRate;
        }

        // Add persistent Items once.
        if (this.persist) {
            this.location.system.addItem(this);
        }
    }

    // Destroy item and attempt to stimulate garbage clearance.
    //
    // Violent set 'true' is destruction result of in game violence ... 'false' if just routing tidy up.
    destruct(violent) {
        // Only desdtruct once.
        if (this.isDestructed()) {
            return;
        }
        
        this.location.system.removeItem(this);

        // If this system is active remove item from the graphics scene.
        if (this.location.system == Game.getGame().universe.system) {
            Game.getGame().getScene().remove(this);
        }

        this.location = undefined;
        this.collideList = undefined;
        this.sounds = undefined;
        this.mesh = undefined;
    }

    isDestructed() {
        return (this.location == undefined);
    }

    // If created in curreent system activate graphics.
    activateIfRequired() {
        if (this.location.system == Game.getGame().getUniverse().system) {
            this.setActive(true);
        }
    }

    // By default just add/remove from scene.
    // Override in Items that support (in)activate when not in use. 
    setActive(state) {
        if (state) {

            // If necessary set up mesh.
            if (undefined == this.mesh) {
                if (this.persist || (this.location.system == Game.getGame().universe.system)) {
                    this.mesh = new THREE.Group();
                    this.setupMesh();

                    // Add non persistent Items for duration of activation.
                    if (!this.persist) {
                        this.location.system.addItem(this);
                    }
                }
            }

            // If in current system add to scene. 
            if (this.location.system == Game.getGame().universe.system) {
                Game.getGame().getScene().add(this);
            }
        } else {
            if (this.persist) {
                // Dont fully destruct
                // Tear down mesh. For memory reduction.
                for (let object in this.children) {
                    this.remove(object);

                    // ... and GC
                    object = undefined;
                }
                this.mesh = undefined;

                // Remove graphics   
                if (this.location.system == Game.getGame().universe.system) {
                    Game.getGame().getScene().remove(this);
                }
            } else {
                // Fully destruct.
                this.destruct(false);
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

    getSpeed() {
        return (this.speed.length());
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

    getSystem() {
        return (this.location.system);
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
            this.speedFrame = speed.clone().divideScalar(Game.getGame().getAnimateRate())
        }
    }

    getLocation() {
        return (this.location);
    }

    setLocation(loc) {
        this.location = loc.clone();
    }

    // Work round for circular dependency with Ship class.
    isShip() {
        return (false);
    }

    getShip() {
        return (Game.getGame().getShip());
    }

    getRadarColour() {
        return (COLOUR);
    }

    generateRotationRate() {
        let rr = Math.random() * 2 * MAX_ROTATION_RATE - MAX_ROTATION_RATE;
        return (rr);
    }

    // Move item in universal space.
    // Optinally detect collisions.
    moveItem(detect) {

        if (detect) {
            this.detectCollisions();
        }

        if (!(this.isDestructed()) && !(this.immobile)) {

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

    // Move mesh in graphics space. Will be relative to ship position.
    moveMesh() {

        let camera = Game.getGame().getScene().getCamera();
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
            if (undefined != this.dockedWith) {
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
        if (undefined != this.rotationRate) {
            let ar = Game.getGame().getAnimateRate();
            this.rotateX(this.rotationRate.x / ar);
            this.rotateY(this.rotationRate.y / ar);
            this.rotateZ(this.rotationRate.z / ar);
        }

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
                    if (undefined == that.getDockedWith()) {
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
        if (!Game.getGame().soundOn) {
            return (false);
        }

        let list = Game.getGame().getListener();
        if ((undefined == list)) {
            // Dont have a listener yet ... give up. without loading
            return (false);
        }


        // We are going to play a sound. Get the buffer.
        let sound = this.sounds.get(name);
        if (undefined == sound) {
            // Need to create/attach PositionalAudio for this Item.
            let buffer = Game.getGame().getSounds().get(name);
            if (undefined == buffer) {
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
        let ship = Game.getGame().getShip();
        if (ship.isDestructed()) {
            // The dead can't hear.
            return(true);
        }

        let rel = this.location.getRelative(ship.location);
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

    setLabel(label, fixed) {

        if ((undefined != this.label) && this.labelFIxed) {
            new BugError("Fixed labels can't be set.")
        }

        this.labelFixed = fixed;

        // Can only have one label.
        this.removeLabel();

        this.labelTxt = label;

        let labelDiv = document.createElement('div');
        labelDiv.className = 'label';
        labelDiv.textContent = this.labelTxt;
        // labelDiv.style.backgroundColor = '#FFFFFF';
        labelDiv.style.color = 'red';
        // labelDiv.font-family = 'sans-serif';
        // labelDiv.padding = '2px';

        this.label = new CSS2DObject(labelDiv);
        this.label.position.set(0, 0, 0);
        this.add(this.label);
        this.label.layers.set(0);
    }

    getLabel() {
        return(this.labelTxt);
    }

    removeLabel() {
        if (this.labelFIxed) {
            // Fixed labels can't be removed.
            return;
        }

        if (undefined != this.label) {
            this.remove(this.label)
            this.label = undefined;
        }
    }
}

export default ItemGraphics;