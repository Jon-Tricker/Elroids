// Base class for any ship (i.e. something with 'ends' that implements the laws of physics).
// Internal impementation of ship is left to the sub-classes.

// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Item from '../GameItems/item.js';
import { Hull } from './Components/Hulls/hull.js';
import Explosion from '../GameItems/explosion.js';
import Universe from '../GameItems/universe.js';
import Mineral from '../GameItems/mineral.js';
import GoodsCrate from '../Trade/goodsCrate.js';
import Station from '../GameItems/System/station.js';
import WormholeEnd from '../GameItems/System/wormholeEnd.js';

// Slightly damped attitude contols to allow fine adjustment.
const ROTATE_RATE_DELTA = 0.125;        // r/s
const ROTATE_RATE_MAX = 5;              // r/s

class TurnRate {
    rate = 0;
    game;

    constructor(game) {
        this.game = game;
    }

    inc(power) {
        let ar = this.game.getAnimateRate();

        let delta = ROTATE_RATE_DELTA / ar;
        if (undefined != power) {
            if (power > 100) {
                power = 100;
            }
            delta *= power / 100;
        }

        if (this.rate < ROTATE_RATE_MAX) {
            this.rate += delta;
        }
    }

    dec(power) {
        let ar = this.game.getAnimateRate();

        let delta = ROTATE_RATE_DELTA / ar;
        if (undefined != power) {
            if (power > 100) {
                power = 100;
            }
            delta *= power / 100;
        }

        if (this.rate > -ROTATE_RATE_MAX) {
            this.rate -= delta;
        }
    }

    zero() {
        this.rate = 0;
    }

    getRate() {
        return (this.rate);
    }

    getDelta() {
        return (ROTATE_RATE_DELTA);
    }
}

class Ship extends Item {

    // ToDo : These really should be part of the 'Hull' sub classes.
    // However for now have all ships are actually the same size (so game mechanics are identcal) and just vary the size of the hull meshes.
    height;
    width;
    length;

    pitchRate;
    yawRate;
    rollRate;

    hull;

    engineSoundOn = false;

    mesh;

    constructor(height, width, length, location, mass, hitPoints, owner) {
        super(location, Universe.originVector, length, mass, hitPoints, owner);

        // Now that we called 'super' can use 'this
        this.height = height;
        this.width = width;
        this.length = length;

        this.pitchRate = new TurnRate(location.system.getGame());
        this.yawRate = new TurnRate(location.system.getGame());
        this.rollRate = new TurnRate(location.system.getGame());

        this.buildShip();
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

        ship.recalc();
    }

    recalc() {
        this.hull.recalc();
    }

    buildShip(hullType) {
        this.hull = new hullType();
        this.hull.buildShip(this);

        this.recalc();
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
        return (this.hull.compSets.getTotalThrust());
    }

    getMaxSpeed() {
        return (this.hull.getMaxSpeed());
    }

    // Get cargo bay
    getBays() {
        return (this.hull.compSets.baySet);
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
            this.setSpeed(Universe.originVector);
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
    rollL(power) {
        this.rollRate.dec(power);
        this.rotateX(this.rollRate.getRate());
    }

    rollR(power) {
        this.rollRate.inc(power);
        this.rotateX(this.rollRate.getRate());
    }

    climb(power) {
        this.pitchRate.dec(power);
        this.rotateY(this.pitchRate.getRate());
    }

    dive(power) {
        this.pitchRate.inc(power);
        this.rotateY(this.pitchRate.getRate());
    }

    yawL(power) {
        this.yawRate.inc(power);
        this.rotateZ(this.yawRate.getRate())
    }

    yawR(power) {
        this.yawRate.dec(power);
        this.rotateZ(this.yawRate.getRate())
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

        this.recalc();

        return (destroyed);
    }

    animate(date) {
        if (null == this.dockedWith) {
            this.moveItem(true);
            this.moveMesh();
        }
    }

    // Get the current directions X axis.
    getOrientation() {
        let xDirection = this.localToWorld(new THREE.Vector3(1,0,0));

        // Above will have included ship position ... remove it.
        xDirection.sub(this.position);
        xDirection.normalize()

        return (xDirection);
    }

    handleCollision(that) {
        // Can't get hit while docked.
        if (null != this.dockedWith) {
            return (false)
        }

        if (that instanceof Mineral) {
            return (this.mineralPickup(that));
        }

        if (that instanceof GoodsCrate) {
            return (this.cratePickup(that));
        }

        if (that instanceof Station) {
            if (that.collideWithShip(this)) {
                return;
            }
        }

        if (that instanceof WormholeEnd) {
            // Try to traverse wormhole.
            return (that.enter(this));
        }

        return (super.handleCollision(that));
    }

    dock(station) {
        // Docking failed.
        if (!station.dock(this)) {
            return (false);
        }

        this.engineOff();
        this.dockedWith = station;
        this.setSpeed(new THREE.Vector3(0, 0, 0));

        this.moveMesh();

        return (true)
    }

    undock() {
        // Skip if not really docked
        if (null == this.dockedWith) {
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

    // Pick up a mineral.
    // Return true if successful.
    mineralPickup(mineral) {
        let mass = Math.ceil(mineral.mass);
        this.loadMineral(mineral.type, mass);
        mineral.destruct();
        return (true);
    }

    loadMineral(mineral, mass) {
        this.getCargoBay().loadMineral(mineral, mass);

        this.recalc();
    }

    // Return mass unloaded.
    unloadMineral(mineral, mass) {
        let unloaded = this.getCargoBay().unloadMineral(mineral, mass);
        this.recalc();
        return (unloaded);
    }

    // Load goods into bay.
    loadGoods(goods) {
        this.getCargoBay().loadGoods(goods);
        this.recalc();
    }

    getCargoCapacity() {
        return (this.getCargoBay().getCapacity())
    }

    getCargoBay() {
        return (this.hull.compSets.baySet)
    }

    getMass() {
        return (this.hull.compSets.getMass());
    }

    getTotalMass() {
        return (this.getMass() + this.getCargoBay().getContentMass())
    }

    // Fire selected weapons
    shoot(date) {
        this.hull.compSets.weaponSet.shoot(this.getOrientation(), date);
    }

    // Get angle to a location.
    angleTo(loc) {
        // Work out delta in ship space.
        let delta = this.getShortestVec(loc);
        this.worldToLocal(delta);

        return (new THREE.Vector3(1, 0, 0).angleTo(delta));
    }

    // Get shortest vector to a location.
    getShortestVec(loc) {
        let vec = loc.clone();

        // Handle wrap round.
        vec.sub(this.location);
        vec.add(this.location);

        return (vec);
    }

    // Get speed in direction of travel
    getFwdSpeed() {
        let spd = this.speed.clone();
        spd.add(this.location);
        this.worldToLocal(spd);
        return (spd.x);
    }
}

export default Ship;