// Base class for any ship (i.e. something with an 'orientation' that implements the laws of physics).
// Internal impementation of ship is left to the sub-classes.

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Game from '../Game/game.js';
import Item from '../GameItems/item.js';
import Explosion from '../GameItems/explosion.js';
import Mineral from '../GameItems/mineral.js';
import GoodsCrate from '../Trade/goodsCrate.js';
import Station from '../GameItems/System/station.js';
import WormholeEnd from '../GameItems/System/wormholeEnd.js';
import BugError from '../Game/bugError.js';
import ComponentSets from './Components/componentSets.js';
import { ComponentAct } from './Components/component.js';

// Slightly damped attitude contols to allow fine adjustment.
const ROTATE_RATE_DELTA = 0.125;        // r/s
const ROTATE_RATE_MAX = 5;              // r/s

class TurnRate {
    rate = 0;

    constructor() {
    }

    inc(power) {
        let ar = Game.getGame().getAnimateRate();

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
        let ar = Game.getGame().getAnimateRate();

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

    // Components in ship.
    compSets;

    hull;

    engineSoundOn = false;

    // Array of Items that we would collide with if went straight forward.
    aheadList = undefined;

    constructor(height, width, length, location, speed, mass, hitPoints, owner) {
        super(location, speed, length, mass, hitPoints, owner);

        // Now that we called 'super' can use 'this
        this.height = height;
        this.width = width;
        this.length = length;

        // All the same for now.
        this.pitchRate = new TurnRate();
        this.yawRate = new TurnRate();
        this.rollRate = new TurnRate();

        this.compSets = new ComponentSets(this);
    }

    buildShip() {
        throw new BugError("Abstract ship cannot be built.")
    }

    toJSON() {
        let json = super.toJSON();
        json.height = this.height;
        json.width = this.width;
        json.length = this.length;

        if (null != this.dockedWith) {
            json.dockedWith = this.dockedWith.getId();
        }

        json.comps = this.compSets.toJSON(this);

        // Pack cargo.
        json.cargo = this.compSets.baySet.cargoToJSON();

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

        // Build component sets.
        ship.compSets = new ComponentSets(ship);

        // Unpack components
        for (let jsonComp of json.comps) {
            let comp = Game.getGame().componentsList.getByClass(jsonComp.class);
            comp = new comp.constructor(comp.getTargetSet(ship));
            comp.status = jsonComp.status;

            if (comp.getTargetSet(ship) == ship.compSets.hullSet) {
                // Do extra stuff for hull. 
                ship.hull = comp;
                ship.hull.setSlots(ship.compSets);
            }

            comp.displayPanel = jsonComp.displayPanel;
            if (comp instanceof ComponentAct) {
                comp.setOn(jsonComp.on);
            }
        }

        // Unpack cargo
        ship.compSets.baySet.loadFromJSON(json.cargo);

        ship.recalc();
    }

    recalc() {
        this.compSets.recalc();
    }

    getCompSets() {
        return(this.compSets);
    }

    // Upgrade to a new hull
    upgradeHull(upHullType) {

        // Check we can afford it.
        let cost = upHullType.getUpgradeCost(this);
        if (Game.getGame().player.getCredits() < cost) {
            throw (new GameError("Not enough credits"));
        }  

        // Check existing components will fit in new hull.

        // New experimental component set with new slot limits.
        let upCompSets = new ComponentSets;
        upHullType.setSlots(upCompSets);

        // Need to iterate both set of sets.
        let upIter = upCompSets.keys();
        let upCurs = upIter.next()
        let thisIter = this.compSets.keys();
        let thisCurs = thisIter.next()
        while ((!thisCurs.done) && (!upCurs.done)) {
            if (upCurs.value.slots < thisCurs.value.size) {
                throw (new GameError("Not enough slots in " + thisCurs.value.plural + ". Unmount/Sell something first."));
            }
            thisCurs = thisIter.next()
            upCurs = upIter.next()
        }

        // Now we know that it can fit just modify the limits on existing component sets ... don't need to copy components. 
        upHullType.setSlots(this.compSets);

        // Make copy of purchace menu item.
        this.compSets.hullSet.clear();
        let upHull = new upHullType.constructor(this.compSets.hullSet, this.hull.getColour())
        this.setHull(upHull);

        // Charge acount.
        if (this.getPlayer().addCredits(-cost));

        // Recalculate
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

    getGunPoint() {
        return (this.hull.getGunPoint());
    }

    // Upgrade the hull (and graphics).
    setHull(hull) {
        this.compSets.hullSet.clear();
        this.compSets.hullSet.add(hull);
        this.compSets.hullSet.recalc();
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
        return (this.compSets.getTotalThrust());
    }

    getMaxSpeed() {
        return (this.hull.getMaxSpeed());
    }

    // Get cargo bay
    getBays() {
        return (this.compSets.baySet);
    }

    getAheadList() {
        return (this.aheadList);
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
            this.setSpeed(new THREE.Vector3());
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
            this.genAheadList();
            super.animate();
        }
    }

    // Builds a list of Items straight ahead.
    genAheadList() {
        this.aheadList = this.genPathList(this.getOrientation());
    }

    // Get the current directions X axis.
    getOrientation() {
        let xDirection = this.localToWorld(new THREE.Vector3(1, 0, 0));

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
        return (this.compSets.baySet)
    }

    getMass() {
        return (this.compSets.getMass());
    }

    getTotalMass() {
        return (this.getMass() + this.getCargoBay().getContentMass())
    }

    // Fire selected weapons
    shoot(date) {
        this.compSets.weaponSet.shoot(this.getOrientation(), date);
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