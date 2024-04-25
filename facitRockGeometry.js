// Graphics for the facited rock

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Universe from './universe.js'

class FacitRockGeometry extends THREE.BufferGeometry {
    vertices;
    indices;
    uvs;
    composition;

    constructor(size, composition) {
        super();
        this.composition = composition;
        this.setupMesh(size);
    }

    setupMesh(size) {

        this.vertices = new Array(
            new THREE.Vector3(this.getRadius(size), 0, 0),       // +x
            new THREE.Vector3(-this.getRadius(size), 0, 0),      // -x
            new THREE.Vector3(0, this.getRadius(size), 0),       // +y
            new THREE.Vector3(0, -this.getRadius(size), 0),      // -y
            new THREE.Vector3(0, 0, this.getRadius(size)),       // +z
            new THREE.Vector3(0, 0, -this.getRadius(size)),      // -z
        );


        this.indices = new Array(
            new THREE.Vector3(0, 2, 4),
            new THREE.Vector3(0, 4, 3),
            new THREE.Vector3(0, 5, 2),
            new THREE.Vector3(0, 3, 5),
            new THREE.Vector3(1, 4, 2),
            new THREE.Vector3(1, 3, 4),
            new THREE.Vector3(1, 2, 5),
            new THREE.Vector3(1, 5, 3),
        );

        this.uvs = new Array(
            new THREE.Vector2(0.5, 0.5),
            new THREE.Vector2(0.5, 0.5),
            new THREE.Vector2(0.5, 0.0),
            new THREE.Vector2(0.5, 1.0),
            new THREE.Vector2(0.0, 0.5),
            new THREE.Vector2(1.0, 1.0),
        );

        // Add extra vertices. Since new vertices are in already mapped triangles should get away without extra uvs.
        let addCount = (Math.floor(Math.random() * this.composition.facets)) * (1 + size/10);
        for (let i = 0; i <= addCount; i++) {
            this.addVertex(size);
        }

        this.setIndex(this.toArray(this.indices));
        this.setAttribute('uv', new THREE.BufferAttribute(this.vector2ToTypedArray(this.uvs), 2));
        this.setAttribute('position', new THREE.BufferAttribute(this.vector3ToTypedArray(this.vertices), 3));
    }

    // Add a vertex in the middle of 3 existing vertices
    addVertex(size) {
        // Pick an face.
        let faceNumber = Math.floor(Math.random() * (this.indices.length / 3));

        // Get existing vertices.
        let vNum1 = this.indices[faceNumber].x;
        let vNum2 = this.indices[faceNumber].y;
        let vNum3 = this.indices[faceNumber].z;
        let v1 = new THREE.Vector3(this.vertices[vNum1].x, this.vertices[vNum1].y, this.vertices[vNum1].z);
        let v2 = new THREE.Vector3(this.vertices[vNum2].x, this.vertices[vNum2].y, this.vertices[vNum2].z);
        let v3 = new THREE.Vector3(this.vertices[vNum3].x, this.vertices[vNum3].y, this.vertices[vNum3].z);
        
        let uv1 = new THREE.Vector2(this.uvs[vNum1].x, this.uvs[vNum1].y);
        let uv2 = new THREE.Vector2(this.uvs[vNum2].x, this.uvs[vNum2].y);
        let uv3 = new THREE.Vector2(this.uvs[vNum3].x, this.uvs[vNum3].y);

        // Create new vertex in middle of triangle.
        // TODO - Should be a random location on the triangle.
        let vNew = new THREE.Vector3(0, 0, 0);
        vNew.add(v1);
        vNew.add(v2);
        vNew.add(v3);
        vNew.divideScalar(3);

        // Multiply it by a random amount (change height)
        vNew.normalize();
        vNew.multiplyScalar(this.getRadius(size));

        // Add new vector to end of vertex list.
        this.vertices.push(vNew);
        let vNewNum = this.vertices.length - 1;

        // Add new uv
        let uvNew = new THREE.Vector2(0, 0);
        uvNew.add(uv1);
        uvNew.add(uv2);
        uvNew.add(uv3);
        uvNew.divideScalar(3);
        this.uvs.push(uvNew);

        // Remove old face from indes list.
        this.indices.splice(faceNumber, 1);

        // Add 3 new faces at end of index list
        this.indices.push(new THREE.Vector3(vNum1, vNum2, vNewNum));
        this.indices.push(new THREE.Vector3(vNum2, vNum3, vNewNum));
        this.indices.push(new THREE.Vector3(vNum3, vNum1, vNewNum));
    }

    // Compute average height.
    getAverageSize() {
        let total = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            total += this.vertices[i].length();
        }
        total /= this.vertices.length;

        // But that's the peaks ... reduce it by a bit.
        total /= Universe.CBRT_THREE; 
        
        return(total);
    }

    // TODO There has to be some easy way to do this ... but I can't find it.
    vector3ToTypedArray(ip) {
        let len = ip.length;
        let op = new Float32Array(len * 3);
        for (let i = 0; i < len; i++) {
            op[i * 3] = ip[i].x;
            op[i * 3 + 1] = ip[i].y;
            op[i * 3 + 2] = ip[i].z;
        }
        return (op);
    }  
    vector2ToTypedArray(ip) {
        let len = ip.length;
        let op = new Float32Array(len * 2);
        for (let i = 0; i < len; i++) {
            op[i * 2] = ip[i].x;
            op[i * 2 + 1] = ip[i].y;
        }
        return (op);
    }
    toArray(ip) {
        let len = ip.length;
        let op = new Array(len * 3);
        for (let i = 0; i < len; i++) {
            op[i * 3] = ip[i].x;
            op[i * 3 + 1] = ip[i].y;
            op[i * 3 + 2] = ip[i].z;
        }
        return (op);
    }

    // Get a randomish radius.
    getRadius(size) {
        return ((0.5 - Math.random()) * size * this.composition.spikyness + size);
    }
}

export default FacitRockGeometry;