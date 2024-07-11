// Basic hull
//
// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Hull from './hull.js'
import BasicEngine from '../Engines/basicEngine.js';
import DumbMissileWeapon from '../Weapons/dumbMissileWeapon.js';
import BasicBay from '../Bays/basicBay.js';

const DESCRIPTION = "A small hull used for scouts and light freighters.";

class BasicHull extends Hull {

    constructor(set) {
        super("GP1", 50, 1000, 3, set, 5, 200);
    } 

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.name + "' is " + DESCRIPTION.toLowerCase());
    }

    buildShip(ship) {
        // Do stuff common for all hulls.
        super.buildShip(ship, 1, 1, 1, 2);

        // Do custom stuff for this hull
        this.compSets.engineSet.add(new BasicEngine());
        this.compSets.weaponSet.add(new DumbMissileWeapon());
        this.compSets.baySet.add(new BasicBay());
    }

    getMesh() {
        let mesh = new THREE.Group();
        let ratio = 2 / 1.5;

        // Save a few 'this.'s
        let length = this.getShip().shipLength;
        let height = this.getShip().height;
        let width = this.getShip().width;

        let vertices = new Float32Array([
            length, 0, 0, // v0 nose
            -length, width * ratio, height * ratio,// v1 left fin top
            -length, width * 2, 0, // v2 left fin mid
            -length, width * ratio, -height * ratio,// v3 left fin bottom
            -length * 0.5, width, height,// v4 cemtre left top
            -length * 0.5, width, -height, // v5 center left bottom
            -length * 0.5, -width, height, // v6 cemter right top
            -length * 0.5, -width, -height,// v7 center right bottom
            -length, -width * ratio, height * ratio,// v8  right fin top
            -length, -width * 2, 0,// v9 right fin mid
            -length, -width * ratio, -height * ratio,// v10 right fin bottom
            -length * 0.5, width, 0, // v11 centre left mid
            -length * 0.5, -width, 0, // v12 centre right mid
        ]);

        let indices = [
            0, 2, 1, // left fin top
            0, 3, 2, // left fin bottom
            0, 4, 6,// center top
            0, 7, 5,// centre bottom
            0, 8, 9, // rt fin top
            0, 9, 10,// rt fin bottom
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

        let bodyGeometry = new THREE.BufferGeometry();

        bodyGeometry.setIndex(indices);
        bodyGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // compute vertex normals
        bodyGeometry.computeVertexNormals();

        let bodyMesh = new THREE.Mesh(bodyGeometry, Hull.shipMaterial);

        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;

        // Add the engine cone
        var engineWidth = width;
        if (height < width) {
            engineWidth = height;
        }
        let engineGeometry = new THREE.ConeGeometry(engineWidth, length, 20, 1, true);

        // compute vertex normals
        engineGeometry.computeVertexNormals();
        let engineMesh = new THREE.Mesh(engineGeometry, Hull.engineMaterial);

        // Mount engine
        engineMesh.rotateZ(-Math.PI / 2);
        engineMesh.position.set(-length * 0.25, 0, height * .25);

        engineMesh.castShadow = true;
        engineMesh.receiveShadow = true;

        var thrusterWidth = engineWidth * 0.5;
        let thrusterGeometry = new THREE.ConeGeometry(thrusterWidth, length / 2, 10, 1, true);

        // compute vertex normals
        thrusterGeometry.computeVertexNormals();
        let thrusterMaterialL = Hull.engineMaterial.clone();
        thrusterMaterialL.color.setHex(0x800000);
        let thrusterMeshL = new THREE.Mesh(thrusterGeometry, thrusterMaterialL);

        // Mount engine
        thrusterMeshL.rotateZ(-Math.PI / 2);
        thrusterMeshL.position.set(-length * 0.5, width * 0.75, height * -.25);

        thrusterMeshL.castShadow = true;
        thrusterMeshL.receiveShadow = true;


        let thrusterMaterialR = Hull.engineMaterial.clone();
        thrusterMaterialR.color.setHex(0x008000);
        let thrusterMeshR = new THREE.Mesh(thrusterGeometry, thrusterMaterialR);

        // Mount engine
        thrusterMeshR.rotateZ(-Math.PI / 2);
        thrusterMeshR.position.set(-length * 0.5, -width * 0.75, height * -.25);

        thrusterMeshR.castShadow = true;
        thrusterMeshR.receiveShadow = true;

        // Add the flame cone
        let flameGeometry = new THREE.ConeGeometry(engineWidth * 0.75, length, 20, 1, false);

        // compute vertex normals
        flameGeometry.computeVertexNormals();
        let flameMesh = new THREE.Mesh(flameGeometry, this.flameMaterial);

        // Position flame
        flameMesh.rotateZ(Math.PI / 2);
        flameMesh.position.set(-length, 0, height * .25);

        // Create the group
        mesh.add(bodyMesh);
        mesh.add(engineMesh);
        mesh.add(thrusterMeshL);
        mesh.add(thrusterMeshR);

        mesh.add(flameMesh);

        return (mesh);
    }
}

export default BasicHull;