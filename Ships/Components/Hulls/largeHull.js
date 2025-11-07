// Large hull
//
// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import { Hull, HullSection } from './hull.js';
import BasicEngine from '../Engines/basicEngine.js';
import BasicRadar from '../Avionics/basicRadar.js';
import DumbMissileWeapon from '../Weapons/dumbMissileWeapon.js';
import BasicBay from '../Bays/basicBay.js';
import { ComponentType } from '../component.js';
import BasicCompass from '../Avionics/basicCompass.js';

const DESCRIPTION = "A large used for heavy freighters.";

class LargeHull extends Hull {

    static type = new ComponentType("GP3", 3, 100, 10000, 6);

    constructor(set) {
        super(LargeHull.type, set, 250);
        super.buildSets(set, 1, 3, 1, 4, 4);
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
        new BasicRadar(this.compSets.avionicsSet);
        new BasicCompass(this.compSets.avionicsSet);

        this.recalc();
    }

    getMesh() {
        // Create the group
        let mesh = new THREE.Group();

        // Work out graphics sizes.
        let scalingFactor = 1.5;
        this.length = this.getShip().length * scalingFactor;
        this.height = this.getShip().height * scalingFactor;
        this.width = this.getShip().width * scalingFactor;

        // Add graphical components.
        mesh.add(this.createBodyMesh());
        mesh.add(this.createEngineMesh(HullSection.PORT, HullSection.TOP));
        mesh.add(this.createEngineMesh(HullSection.STARBOARD, HullSection.TOP));
        mesh.add(this.createEngineMesh(HullSection.CENTER, HullSection.BOTTOM));
        mesh.add(this.createThrusterMesh(HullSection.PORT, HullSection.BOTTOM));
        mesh.add(this.createThrusterMesh(HullSection.STARBOARD, HullSection.BOTTOM));
        mesh.add(this.createThrusterMesh(HullSection.PORT, HullSection.TOP));
        mesh.add(this.createThrusterMesh(HullSection.STARBOARD, HullSection.TOP));
        mesh.add(this.createCockpitMesh());

        return (mesh);
    }

    createBodyMesh() {
        // Save a few 'this.'s
        let length = this.length;
        let height = this.height;
        let width = this.width;

        let vertices = new Float32Array([
            length, width * 0.5, 0, // v0 nose left
            -length, width, height,// v1 left fin top
            -length, width * 1.2, 0, // v2 left fin mid
            -length, width , -height,// v3 left fin bottom
            -length * 0.5, width, height,// v4 cemtre left top
            -length * 0.5, width, -height, // v5 center left bottom
            -length * 0.5, -width, height, // v6 cemter right top
            -length * 0.5, -width, -height,// v7 center right bottom
            -length, -width, height,// v8 right fin top
            -length, -width * 1.2, 0,// v9 right fin mid
            -length, -width, -height,// v10 right fin bottom
            -length * 0.5, width, 0, // v11 centre left mid
            -length * 0.5, -width, 0, // v12 centre right mid
            length, -width * 0.5, 0, // v13 nose right
            0, width, height, // v14 Midship top left
            0, -width, height, // v15 Midship top right
            0, width, -height, // v16 Midship bottom left
            0, -width, -height, // v17 Midship bottom right
            0, width * 1.2, 0, // v18 Midship mid left
            0, -width * 1.2, 0 // v19 Midship mid right
        ]);

        let indices = [
            0, 18, 14, // left fin top front
            0, 16, 18, // left fin bottom front
            0, 14, 13, //  left top front
            0, 17, 16, // left bottom front
            14, 15, 13, // right top front
            0, 13, 17, // right bottom front
            13, 15, 19, // rt fin top front
            13, 19, 17, // rt fin bottom front
            4, 6, 14, // left top rear
            7, 5, 16, // left bottom rear
            6, 15, 14, // rt top rear
            7, 16, 17, // rt bottom rear
            5, 6, 4, // back plate A
            6, 5, 7, // back plate B
            1, 2, 11, // fin left inner top A
            11, 4, 1, // fin left inner top B
            1, 14, 2,// fin left top rear A
            14, 18, 2, // fin left top rear B
            2, 18, 3, // fin left bottom rear A
            3, 18, 16, // fin left bottom rear B
            3, 11, 2, // fin left inner bottom A
            11, 3, 5, // fin left inner bottom B
            8, 12, 9, // fin right inner top A
            12, 8, 6, // fin right inner top B
            8, 9, 15,// fin right top rear A
            9, 19, 15,// fin right top rear B
            9, 10 , 19, // fin right bottom rear A
            10, 17, 19, // fin right bottom rear B
            10, 9, 12, // fin right inner bottom A
            12, 7, 10, // fin right inner top bottom

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
        mesh.position.set(size * 1.5, 0, this.height - size / 1.7);

        return (mesh);
    }
}

export default LargeHull;