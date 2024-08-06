// Everything related to the simulated 'Universe'.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';
import System from './GameItems/System/system.js';

class Universe {
    // Back reference to out parent.
    game;

    // Univrese time. If animation stpped can be paused.
    universeTime = 0;

    // Size of universe before wrap round. Total width will be twice this.
    uniSize;                        // Some large unit (light years?)

    // Size of default system  before wrap round. Total width will be twice this.
    systemSize;                     // m

    nextAnimateTime = Date.now();
    lastAnimateTime = Date.now();
    actualAnimateRate = 0;

    // List of systems.
    systems = new Set();

    // Current system
    system;

    static CBRT_THREE = Math.cbrt(3);
    static originVector = new THREE.Vector3(0, 0, 0);

    constructor(game, uniSize, systemSize, maxRockCount) {
        this.game = game;
        this.uniSize = uniSize;
        this.systemSize = systemSize; 

        // Create initial system
        this.system = new System(this, this.systemSize, maxRockCount);
        
        this.actualAnimateRate = game.ANIMATE_RATE;
    }

    populate() {
        this.system.populate();
        this.systems.add(this.system);
    }

    // Animate all objects.
    animate(date, keyBoard) {
        if (date >= this.nextAnimateTime) {
            if (undefined != this.actualAnimateRate) {
                this.universeTime += 1000 / this.actualAnimateRate;
            }
            this.nextAnimateTime = date + 1000 / this.game.getAnimateRate();

            this.system.animate(this.universeTime, keyBoard);

            this.actualAnimateRate = 1000 / (date - this.lastAnimateTime);
            this.lastAnimateTime = date;
        }
    }

    getActualAnimateRate() {
        return (this.actualAnimateRate)
    }

    getTime() {
        return (this.universeTime);
    }

    // Checks and handles wrap round of a vector.
    handleWrap(vec) {
        let sz = this.systemSize;

        if (vec.x > sz) {
            vec.x -= 2 * sz;
        }
        if (vec.x < -sz) {
            vec.x += 2 * sz;
        }
        if (vec.y > sz) {
            vec.y -= 2 * sz;
        }
        if (vec.y < -sz) {
            vec.y += 2 * sz;
        }
        if (vec.z > sz) {
            vec.z -= 2 * sz;
        }
        if (vec.z < -sz) {
            vec.z += 2 * sz;
        }
    }
}

export default Universe;