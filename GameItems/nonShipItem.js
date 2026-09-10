// Items that ane not the ship

// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';
import Game from '../Game/game.js';
import Item from './item.js';
import Explosion from './explosion.js';

const MAX_ROTATION_RATE = 0.5;    // R/s

class NonShipItem extends Item {

    rotationRate;

    // Unique id.
    // During the game Items are passed by reference.
    // However for save/load we need a uniqueID.
    static idCount = 0;
    myId;

    constructor(location, speed, size, mass, hitPoints, owner, immobile, id, rotating) {
        super(location, speed, size, mass, hitPoints, owner, immobile);
        if (undefined == id) {
            // Generate a sequential id
            this.myId = NonShipItem.idCount++;
        } else {
            this.myId = id;
        }

        if ((undefined == rotating) || (true == rotating)) {
            this.rotationRate = new THREE.Vector3(this.generateRotationRate(), this.generateRotationRate(), this.generateRotationRate());
        }
    }

    toJSON() {
        let json = super.toJSON();
        json.id = this.myId;
        return (json);
    }

    getId() {
        return (this.myId);
    }

    // Take damage to self.
    // Return 'true' if destroyed.
    takeDamage(hits, that) {
        let destroyed = super.takeDamage(hits, that);

        if (destroyed) {
            // Has to be here because otherwise a circular dependancy between Item and Explosion.
            new Explosion(this.size, this);
        }
        return (destroyed);
    }

    generateRotationRate() {
        let rr = Math.random() * 2 * MAX_ROTATION_RATE - MAX_ROTATION_RATE;
        return (rr);
    }

    animate() {

        if (undefined != this.rotationRate) {
            let ar = Game.getGame().getAnimateRate();
            this.rotateX(this.rotationRate.x / ar);
            this.rotateY(this.rotationRate.y / ar);
            this.rotateZ(this.rotationRate.z / ar);
        }

        super.animate();

    }
}

export default NonShipItem;