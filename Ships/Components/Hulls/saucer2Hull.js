// Saucer hull ... only available for non-player ships.
//
// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import { Hull, HullSection } from './hull.js';
import { ComponentType } from '../component.js';

class Saucer2Hull extends Hull {

    static type = new ComponentType("Saucer hull", 1, 50, undefined, 1);

    constructor(set, hullColour) {
        super(set, 200, hullColour);
    }

    // Customise components sets.
    setSlots(sets) {
        super.setSlots(sets, 1, 1, 1, 2, 3);
    }

    // 'Front' of hull is 'top' of saucer.
    getMesh() {
        let mesh = new THREE.Group()

        // Add graphical components.
        mesh.add(this.createBodyMesh());
        mesh.add(this.createCockpitMesh());

        return (mesh);
    }

    createBodyMesh() {
        let scalingFactor = 0.8;
        let size = this.getShip().length * scalingFactor;

        // Dish cones thickness
        let thick = size / 3;

        let material = this.getShipMaterial();

        let sphereGeometry = new THREE.SphereGeometry(size / 2, 64, 64);

        // compute vertex normals
        sphereGeometry.computeVertexNormals();

        let sphereMesh = new THREE.Mesh(sphereGeometry, material);

        sphereMesh.castShadow = true;
        sphereMesh.receiveShadow = true;

        let lowerGeometry = new THREE.ConeGeometry(size, thick, 10);
        lowerGeometry.computeVertexNormals();

        let lowerMesh = new THREE.Mesh(lowerGeometry, material);

        lowerMesh.rotateZ(Math.PI / 2);
        lowerMesh.position.set(-thick / 2, 0, 0);

        lowerMesh.castShadow = true;
        lowerMesh.receiveShadow = true;

        let upperGeometry = new THREE.ConeGeometry(size, thick, 10);
        upperGeometry.computeVertexNormals();

        let upperMesh = new THREE.Mesh(upperGeometry, material);

        upperMesh.rotateZ(-Math.PI / 2);
        upperMesh.position.set(thick / 2, 0, 0);

        upperMesh.castShadow = true;
        upperMesh.receiveShadow = true;

        let mesh = new THREE.Group()

        mesh.add(sphereMesh);
        mesh.add(lowerMesh);
        mesh.add(upperMesh);

        return (mesh);
    }

    createCockpitMesh() {
        let scalingFactor = 0.8;
        let size = this.getShip().length * scalingFactor;
        let winSz = size/15;

        let mesh = new THREE.Group()

        // Work out window pos for 45 degrees up and partialy burried.
        let pos = Math.sqrt((size * size)/8) - (winSz/3);

        for (let i = 0; i < 4; i++) {

            let sphereGeometry = new THREE.SphereGeometry(winSz, 16, 16);

            // compute vertex normals
            sphereGeometry.computeVertexNormals();

            let sphereMesh = new THREE.Mesh(sphereGeometry, Hull.glassMaterial);

            sphereMesh.castShadow = true;
            sphereMesh.receiveShadow = true;

            switch (i) {
                case 0:
                    sphereMesh.position.set(pos, pos, 0);
                    break;

                case 1:
                    sphereMesh.position.set(pos, -pos, 0);
                    break;

                case 2:
                    sphereMesh.position.set(pos, 0, pos);
                    break;

                default:
                    sphereMesh.position.set(pos, 0, -pos);
                    break;
            }

            mesh.add(sphereMesh)
        }

        return (mesh);
    }
}

export default Saucer2Hull;