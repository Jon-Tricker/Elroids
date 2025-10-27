// Location of an object in game space.
// 
// Extends Vector3 to include the system coordinate and optionally handle wrap round.
// 
// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import BugError from '../bugError.js';

class Location extends THREE.Vector3 {

    // System pointer.
    system;

    constructor(x, y, z, system) {
        super(x, y, z);
        this.setSystem(system);
    }

    toJSON() {
        // Just save the vector. System is inplicit in our location in the JSON heirachy. 
        return {
            x: this.x,
            y: this.y,
            z: this.z
        }
    }

    static fromJSON(json, system) {
        return (new Location(json.x, json.y, json.z, system));
    }

    clone() {
        return new Location(this.x, this.y, this.z, this.system);
    }

    equals(that) {
        return ((super.equals(that)) && (this.system == that.system));
    }

    add(that, wrap) {
        this.validate(this, that);
        super.add(that);
        this.handleWrap(wrap);
    }

    sub(that, wrap) {
        this.validate(this, that);
        super.sub(that);
        this.handleWrap(wrap);
    }

    addVectors(a, b, wrap) {
        this.validate(a, b);
        super.addVectors(a, b);
        this.handleWrap(wrap);
    }

    copy(that) {
        super.copy(that);
        this.system = that.system;
    }

    setSystem(system) {
        this.system = system;
    }

    distanceTo(that) {
        let dist = super.distanceTo(that);
        if (dist > this.system.size) {
            dist -= this.system.size;
        }
        return (dist);
    }

    divide(that, wrap) {
        this.validate(this, that);
        super.divide(that);
        this.handleWrap(wrap);
    }

    divideScalar(that, wrap) {
        super.divideScalar(that);
        this.handleWrap(wrap);
    }

    multiply(that, wrap) {
        this.validate(this, that);
        super.multiply(that);
        this.handleWrap(wrap);
    }

    multiplyScalar(that, wrap) {
        super.multiplyScalar(that);
        this.handleWrap(wrap);
    }

    multiplyVectors(a, b, wrap) {
        this.validate(a, b);
        super.multiplyVectors(a, b);
        this.handleWrap(wrap);
    }

    subVectors(a, b, wrap) {
        this.validate(a, b);
        super.subVectors(a, b);
        this.handleWrap(wrap);
    }

    // Get location relative to this.
    // Handles relative locations through wrap round.
    getRelative(that) {
        // That may be a simple Vector3. So clone this.
        let rel = this.clone();
        rel.negate();
        rel.add(that);
        return (rel);
    }

    static createRandomInSystem(system, integer) {
        let max = system.systemSize;

        let x = Math.random() * max * 2 - max;
        let y = Math.random() * max * 2 - max;
        let z = Math.random() * max * 2 - max;

        if ((undefined != integer) && integer) {
            x = Math.floor(x);
            y = Math.floor(y);
            z = Math.floor(z);
        }

        return (new Location(x, y, z, system));
    }

    // Get a random location far away from this loction. 
    getFarAway() {
        let sz = this.system.systemSize;
        let loc = this.clone();

        let delta = Location.createRandomInSystem(this.system);

        // Move it to one edge of the universe.
        switch (Math.floor(Math.random()) * 3) {
            case 0:
                delta.x = sz;
                break;

            case 1:
                delta.y = sz;
                break;

            case 2:
            default:
                delta.z = sz;
                break;
        }

        loc.add(delta);

        return (loc);
    }

    // Handle wrap round.
    handleWrap(wrap) {
        if ((undefined != wrap) && !wrap) {
            // Don't wrap.
            return;
        }

        let sz = this.system.systemSize;

        if (this.x > sz) {
            this.x = -sz + (this.x % sz);
        }
        if (this.x < -sz) {
            this.x = sz + (this.x % sz);
        }

        if (this.y > sz) {
            this.y = -sz + (this.y % sz);
        }
        if (this.y < -sz) {
            this.y = sz + (this.y % sz);
        }

        if (this.z > sz) {
            this.z = -sz + (this.z % sz);
        }
        if (this.z < -sz) {
            this.z = sz + (this.z % sz);
        }
    }

    // Validate that two Locations are compatible.
    validate(a, b) {
        if ((undefined == a.system) || (undefined == b.system)) {
            // Probably adding a normal Vector3.
            return;
        }

        // ToDo : Remove this once re-factoring complete.
        if ((!a instanceof Location) || (!b instanceof Location)) {
            throw new BugError("Dodgy location types.")
        }

        if (a.system != b.system) {
            throw new BugError("Locations not in same system.")
        }
    }

}

export default Location;