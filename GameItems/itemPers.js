// A persistable verison on Item.

// Persistable Items:
//  Are saved as JSON objects when game is saved.
//  Continue to exist when player ship is not in their system (although meshes etc. may be deleted for memory reduction). Won't be animated.

// Non persistable Items:
//  Are not saved in the save image.
//  Are destroyed when player ship not in their system.
//  Are randomly recreated as necessary. 

// Copyright (C) Jon Tricker 2023, 2024, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';
import Location from '../Game/Utils/location.js';
import BugError from '../Game/bugError.js';
import Item from './item.js';
import JSONQuaternion from '../Game/Utils/jsonQuaternion.js';


class ItemPers extends Item {

    // Unique id.
    // During the game Items are passed by reference.
    // However for save/load we need a uniqueID.
    static idCount = 0;
    myId;

    // Construct with optional mass
    // Can be constructed either with indivisual args or a JSON doc.
    constructor(json, location, speed, size, mass, hitPoints, owner, immobile, myId, rotationRate, persist) {
        if (undefined != json) {
            // Unpack JSON doc.
            location = new Location(json.location);

            let sp = json.speed;
            speed = new THREE.Vector3(sp.x, sp.y, sp.z);

            size = json.size;
            mass = json.mass;
            hitPoints = json.hitPoints;
            owner = json.owner;
            immobile = json.immobile;

            let rr = json.rotationRate;
            rotationRate = new THREE.Vector3(rr.x, rr.y, rr.z);
            
            myId = json.myId;
            persist = json.persist;

            if (!persist) {
                throw new BugError("Non persisted object cannot be restored from JSON.")
            }
        }

        super(location, speed, size, mass, hitPoints, owner, immobile, rotationRate, persist);

        if (undefined != json) {
            this.setRotationFromQuaternion(new JSONQuaternion(json.quart));
        }

        if (undefined == myId) {
            // Generate a sequential id
            this.myId = ItemPers.idCount++;
        } else {
            this.myId = myId;
        }
    }

    // Stuff saved to all items.
    toJSON() {
        
        if (!this.persist) {
                throw new BugError("Non persisted object cannot be saved to JSON.")
        }

        // Encode rotation as reasonable length Quartarian.
        let quart = new JSONQuaternion();
        this.getWorldQuaternion(quart);

        return {   
            location: this.location.toJSON(),
            speed: this.speed,
            size: this.size,
            mass: this.mass,
            hitPoints: this.hitPoints,
            owner: this.owner,
            immobile: this.immobile,
            rotationRate: this.rotationRate,
            myId: this.myId,
            persist: this.persist,
            quart: quart.toJSON()
        };
    }

    getId() {
        return (this.myId);
    }    
}

export default ItemPers;