// Everything related to the simulated 'Universe'. Does not include artefacts related to the 'game' (e.g. cameras or the skybox).

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import * as THREE from 'three';

// Load textures once.
export const craterTexture = new THREE.TextureLoader().load("./Scenery/CraterTexture.gif");
craterTexture.wrapS = THREE.RepeatWrapping;
craterTexture.wrapT = THREE.RepeatWrapping;
craterTexture.repeat.set(4, 4);

const ANIMATE_RATE = 25;  // frames/second

class Universe {

    // Univrese time. If animation stpped can be paused.
    static universeTime = 0;

    // Size of universe before wrap round. Total width will be twice this.
    static UNI_SIZE;

    static CBRT_THREE = Math.cbrt(3);

    // All items in the simulation.
    static itemList = new Set();

    static nextAnimateTime = Date.now();
    static lastAnimateTime = Date.now();
    static actualAmimateRate = ANIMATE_RATE;

    static addItem(item) {
        this.itemList.add(item);
    }

    static getCraterTexture() {
        return(craterTexture);
    }

    static getAnimateRate() {
        // Return the achieved frame rate.
        return(ANIMATE_RATE);

        // TODO: I tried this ... the frame rate became lousey.
        // return(this.actualAmimateRate);
    }

    static removeItem(item) {
        this.itemList.delete(item);
    }

    // TODO. Horible hack.
    static setSize(size) {
        this.UNI_SIZE = size;
    }

    // Animate all objects.
    static animate(date, keyBoard) {
        if (date >= this.nextAnimateTime) {
            this.universeTime += 1000 / this.getActualAnimateRate();
            this.nextAnimateTime = date + 1000 / this.getAnimateRate();

            for (let item of Universe.itemList) {
                item.animate(this.universeTime, keyBoard);
            }
            this.actualAmimateRate = 1000/(date - this.lastAnimateTime);
            this.lastAnimateTime = date;
        }
    }

    static getActualAnimateRate() {
        return(this.actualAmimateRate)
    }

    static getTime() {
        return(this.universeTime);
    }

    // Checks and handles wrap round of a vector.
    static handleWrap(vec) {
        if (vec.x > Universe.UNI_SIZE) {
            vec.x -= 2 * Universe.UNI_SIZE;
        }
        if (vec.x < -Universe.UNI_SIZE) {
            vec.x += 2 * Universe.UNI_SIZE;
        }
        if (vec.y > Universe.UNI_SIZE) {
            vec.y -= 2 * Universe.UNI_SIZE;
        }
        if (vec.y < -Universe.UNI_SIZE) {
            vec.y += 2 * Universe.UNI_SIZE;
        }
        if (vec.z > Universe.UNI_SIZE) {
            vec.z -= 2 * Universe.UNI_SIZE;
        }
        if (vec.z < -Universe.UNI_SIZE) {
            vec.z += 2 * Universe.UNI_SIZE;
        }
    }

    // Move everything out of a box Could be more sophisticated.
    static clearBox(xmin, ymin, zmin, xmax, ymax, zmax) {

        let min = new THREE.Vector3(xmin, ymin, zmin);
        let max = new THREE.Vector3(xmax, ymax, zmax);
        let clearBox = new THREE.Box3(min, max);

        for (let item of Universe.itemList) {
            let thatBoundary = item.getBoundary();
            if ((null != thatBoundary) && (thatBoundary.intersectsBox(clearBox))) {
                // Bounce it far away.
                if (item.location.x < 0) {
                    item.location.x += Universe.UNI_SIZE;
                } else {
                    item.location.x -= Universe.UNI_SIZE;
                }  
                
                if (item.location.y < 0) {
                    item.location.y += Universe.UNI_SIZE;
                } else {
                    item.location.y -= Universe.UNI_SIZE;
                }  
                
                if (item.location.z < 0) {
                    item.location.z += Universe.UNI_SIZE;
                } else {
                    item.location.z -= Universe.UNI_SIZE;
                }
            }
        }
    }


}

export default Universe;