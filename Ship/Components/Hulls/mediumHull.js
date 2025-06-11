// Medium hull
//
// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import { Hull, HullSection } from './hull.js';
import BasicEngine from '../Engines/basicEngine.js';
import Radar from '../Avionics/basicRadar.js';
import DumbMissileWeapon from '../Weapons/dumbMissileWeapon.js';
import BasicBay from '../Bays/basicBay.js';
import { ComponentType } from '../component.js';

const DESCRIPTION = "A small hull used for scouts and light freighters.";

class MediumHull extends Hull {

    static type =  new ComponentType("GP2", 2, 50, 5000, 4);

    constructor(set) {
        super(MediumHull.type, set, 250);
        super.buildSets(1, 2, 1, 2, 4);  
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }

    buildShip(ship) {
        // Do stuff common for all hulls.
        super.buildShip(ship);

        // Do custom stuff for this hull
        new BasicEngine(this.compSets.engineSet);
        new BasicEngine(this.compSets.engineSet);
        new DumbMissileWeapon(this.compSets.weaponSet);
        new BasicBay(this.compSets.baySet);
        new Radar(this.compSets.avionicsSet);
    }

    getMesh() {
        // Create the group
        let mesh = new THREE.Group();
        
        // Work out graphics sizes.
        let scalingFactor = 1;
        this.length = this.getShip().shipLength * scalingFactor;
        this.height = this.getShip().height * scalingFactor;
        this.width = this.getShip().width * scalingFactor;

        // Add graphical components.
        mesh.add(this.createBodyMesh());
        mesh.add(this.createEngineMesh(HullSection.PORT, HullSection.TOP));
        mesh.add(this.createEngineMesh(HullSection.STARBOARD, HullSection.TOP));
        mesh.add(this.createThrusterMesh(HullSection.PORT, HullSection.BOTTOM));
        mesh.add(this.createThrusterMesh(HullSection.STARBOARD, HullSection.BOTTOM));
        mesh.add(this.createCockpitMesh());

        return (mesh);
    }

    createBodyMesh() {
        let ratio = 2 / 1.5;

        // Save a few 'this.'s
        let length = this.length;
        let height = this.height;
        let width = this.width;

        let vertices = new Float32Array([
            length, width * 0.5, 0, // v0 nose left
            -length, width * ratio, height * ratio,// v1 left fin top
            -length, width * 2, 0, // v2 left fin mid
            -length, width * ratio, -height * ratio,// v3 left fin bottom
            -length * 0.5, width * 1.25, height,// v4 cemtre left top
            -length * 0.5, width * 1.25 , -height, // v5 center left bottom
            -length * 0.5, -width * 1.25, height, // v6 cemter right top
            -length * 0.5, -width * 1.25, -height,// v7 center right bottom
            -length, -width * ratio, height * ratio,// v8  right fin top
            -length, -width * 2, 0,// v9 right fin mid
            -length, -width * ratio, -height * ratio,// v10 right fin bottom
            -length * 0.5, width, 0, // v11 centre left mid
            -length * 0.5, -width, 0, // v12 centre right mid
            length, -width * 0.5, 0, // v13 nose right
        ]);

         let indices = [
            0, 2, 1, // left fin top
            0, 3, 2, // left fin bottom
            0, 4, 6,// center left top
            0, 7, 5,// centre left bottom
            13, 0, 6,// center right top
            13, 7, 0,// centre right bottom
            13, 8, 9, // rt fin top
            13, 9, 10,// rt fin bottom
            5, 6, 4, // back plate A
            6, 5, 7,// back plate B
            1, 2, 11,// fin left inner top A
            11, 4, 1,// fin left inner top B
            3, 11, 2,// fin left inner bottom A
            11, 3, 5,// fin left inner bottom B
            8, 12, 9,// fin right inner top A
            12, 8, 6,// fin right inner top B
            10, 9, 12,// fin right inner bottom A
            12, 7, 10,// fin right inner top bottom

        ];

        let geometry = new THREE.BufferGeometry();

        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // compute vertex normals
        geometry.computeVertexNormals();

        let mesh = new THREE.Mesh(geometry, Hull.shipMaterial);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return (mesh);
    }

    createCockpitMesh() {
        let size = this.width;
        if (this.height < size) {
            size = this.height;
        }

        let geometry = new THREE.SphereGeometry(size * 0.8, 20, 20);

        // compute vertex normals
        geometry.computeVertexNormals();
        let mesh = new THREE.Mesh(geometry, Hull.glassMaterial);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Mount
        mesh.rotateZ(-Math.PI / 2);
        mesh.rotateX(-Math.PI / 20);
        mesh.position.set(size * 1.5 , 0, this.height - size / 1.7);

        return (mesh);
    }


}

export default MediumHull;