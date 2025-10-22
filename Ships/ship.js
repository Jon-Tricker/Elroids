// Base class for any ship that implements the laws of physics.
// Internal impementation of ship is left to the sun-classes.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Item from '../GameItems/item.js';
import { Hull } from './Components/Hulls/hull.js';
import Explosion from '../GameItems/explosion.js';

// Slightly damped attitude contols to allow fine adjustment.
const ROTATE_RATE_DELTA = 0.125;        // r/s
const ROTATE_RATE_MAX = 5;              // r/s

class Ship extends Item {

    // ToDo : These really should be part of the 'Hull' sub classes.
    // However for now have all ships are actually the same size (so game mechanics are identcal) and just vary the size of the hull meshes.
    height;
    width;
    length;

    pitchRate = 0;
    yawRate = 0;
    rollRate = 0;

    hull;

    engineSoundOn = false;

    mesh;

    constructor(system, height, width, length, location, mass, hitPoints, owner) {
        super(system, location.x, location.y, location.z, 0, 0, 0, length, mass, hitPoints, owner);

        // Now that we called 'super' can use 'this
        this.height = height;
        this.width = width;
        this.length = length;
    }

    toJSON() {
        let json = super.toJSON();
        json.height = this.height;
        json.width = this.width;
        json.length = this.length;

        if (null != this.dockedWith) {
            json.dockedWith = this.dockedWith.getId();
        }

        json.hull = this.hull.toJSON();

        return (json);
    }

    static fromJSON(json, system, ship) {
        if (undefined == json.dockedWith) {
            ship.rotateX(json.rotationx);
            ship.rotateY(json.rotationy);
            ship.rotateZ(json.rotationz);
        } else {
            ship.dock(system.getItemById(json.dockedWith));
        }

        // Make new hull.
        // Will also add it to ship.
        Hull.fromJSON(json.hull, ship);
    }

    setActive(state) {
        if (!state) {
            super.setActive(state);

            if (undefined != this.mesh) {
                this.remove(this.mesh);
                this.mesh = null;
            }
        } else {
            this.setupMesh();

            // Only move to scene if not part of something else.
            if (null == this.getDockedWith()) {
                super.setActive(state);
            }
        }
    }

    // Upgrade the hull (and graphics).
    setHull(hull) {
        this.hull = hull;
        this.setupMesh();
    }

    setupMesh() {
        if (undefined != this.mesh) {
            this.remove(this.mesh);
        }

        this.mesh = this.hull.getMesh();
        this.add(this.mesh);
    }

    // Get total available thrust
    getThrust() {
        return (0);
    }

    getMaxSpeed() {
        return (this.hull.getMaxSpeed());
    }

    accelerate() {
        let xDirection = this.getOrientation();

        let thrust = this.getThrust();
        if (0 < thrust) {
            this.hull.setFlameState(true);
            this.setEngineSound(true);
            this.thrust(thrust, xDirection, this.getMaxSpeed());
        } else {
            this.engineOff();
        }
    }

    decelerate() {
        this.hull.setFlameState(false);
        if (1 > this.getSpeed()) {
            // Stop
            this.speed.multiplyScalar(0);
            this.engineOff();
            return;
        }

        // Thrust in opposite direction to speed.
        let xDirection = this.speed.clone();
        xDirection.multiplyScalar(-1);

        let thrust = this.getThrust();
        if (0 < thrust) {
            this.setEngineSound(true);
            this.thrust(thrust, xDirection, this.getMaxSpeed());
        } else {
            this.engineOff();
        }
    }


    // In general to rotate. Asjust relative to our own axis.
    // Positive is clockwise when looking at the origin. So needs to be reversed for roll and pitch when we a re looking away from origin.
    rollL() {
        if (this.rollRate > -ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.rollRate -= ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateX(this.rollRate);
    }

    rollR() {
        if (this.rollRate < ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.rollRate += ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateX(this.rollRate);
    }

    climb() {
        if (this.pitchRate > -ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.pitchRate -= ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateY(this.pitchRate);
    }

    dive() {
        if (this.pitchRate < ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.pitchRate += ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateY(this.pitchRate);
    }

    yawL() {
        if (this.yawRate < ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.yawRate += ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateZ(this.yawRate);
    }

    yawR() {
        if (this.yawRate > -ROTATE_RATE_MAX / this.getGame().getAnimateRate()) {
            this.yawRate -= ROTATE_RATE_DELTA / this.getGame().getAnimateRate();
        }
        this.rotateZ(this.yawRate);
    }

    engineOff() {
        this.hull.setFlameState(false);
        this.setEngineSound(false);
    }

    // Base class makes no sounds.
    setEngineSound(state) {
        this.engineSoundOn = state;
    }

    // Ships do some dameage when they ram things.
    doDamage(that) {
        that.takeDamage(this.getRamDamage(), this);
    }

    // Take damage to self.
    // Return 'true' if destroyed.
    takeDamage(hits, that) {
        let destroyed = super.takeDamage(hits, that);
        if (destroyed) {
            new Explosion(this.size, this);
        }
        return (destroyed);
    }

    animate(date) {
        if (null == this.dockedWith) {
            this.moveItem(true);
            this.moveMesh();
        }
    }


    // Some on line magic to get the current directions X access
    getOrientation() {
        let e = this.matrixWorld.elements;
        let xDirection = new THREE.Vector3();
        xDirection.set(e[0], e[1], e[2])
        xDirection = xDirection.normalize()
        return (xDirection);
    }

    handleCollision(that) {
        // Can't get hit while docked.
        if (null != this.dockedWith) {
            return (false)
        }

        super.handleCollision(that);
    }

    dock(station) {
        // Docking failed.
        if (!station.dock(this)) {
            return(false);
        }

        this.engineOff();
        this.dockedWith = station;
        this.setSpeed(new THREE.Vector3(0, 0, 0));

        this.moveMesh();

        return(true)
    }

    undock() {
        // Skip if not really docked
        if(null == this.dockedWith) {
            return;
        }
        
        this.dockedWith.undock(this);
        this.dockedWith = null;   


        this.moveMesh();
        this.moveItem(false);
    }

    getDockedWith() {
        return (this.dockedWith);
    }

    // Pick up a goods crate.
    // Return true if successful.
    cratePickup(crate) {
        // Store goods
        this.loadGoods(crate.contents);
        crate.destruct();
        return (true);
    }

    // Load goods into bay.
    loadGoods(goods) {
    }

    // Pick up a mineral.
    // Return true if successful.
    mineralPickup(mineral) {
        let mass = Math.ceil(mineral.mass);
        this.loadMineral(mineral.type, mass);
        mineral.destruct();
        return (true);
    }

    loadMineral(mineral, mass) {
    }
}

export default Ship;