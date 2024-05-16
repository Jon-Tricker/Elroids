// Space station graphic and physics

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem from './nonShipItem.js';
import Universe from '../universe.js';
import Ship from '../Ship/ship.js'
import Texture from '../Utils/texture.js'
import { ModelViewProjectionNode } from 'three/examples/jsm/nodes/Nodes.js';


const ROTATE_RATE = 0.1;    // r/s
const STATION_HP = 1;
const STATION_MASS = 10000; // t

const BOX_HEIGHT = 70;
const BOX_WIDTH = 90;
const BOX_DEPTH = 50;

const BAY_HEIGHT = 30;
const BAY_WIDTH = 70;
const BAY_DEPTH = 40;

// Must be odd so can have a center line
const BAY_TEXTURE_SIZE = 21;

const TUBE_RADIUS = 10;
const TORUS_RADIUS = Math.sqrt(BOX_WIDTH * BOX_WIDTH + BOX_HEIGHT * BOX_HEIGHT) / 2 + TUBE_RADIUS / 2;
const STATION_SIZE = TORUS_RADIUS + TUBE_RADIUS; // m

const MAX_DOCKING_SPEED = 10; // m/s

const COLOUR = "#D0FFD0";
const BAY_COLOUR = "white";
const STATION_MATERIAL = new THREE.MeshStandardMaterial(
    {
        color: COLOUR,
        roughness: 0.75,
        opacity: 1,
        side: THREE.DoubleSide,
        metalness: 0.75,
    }
)

const BAY_MATERIAL = new THREE.MeshStandardMaterial(
    {
        color:  BAY_COLOUR,
        roughness: 0.75,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        metalness: 0.75
    }
)

class Station extends NonShipItem {

    bayMesh;

    constructor(locationX, locationY, locationZ, game, owner) {
        super(locationX, locationY, locationZ, 0, 0, 0, game, STATION_SIZE, STATION_MASS, STATION_HP, owner, true);

        this.setupMesh();

        if (!game.testMode) {
            this.rotateX(Math.random() * Math.PI);
            this.rotateZ(Math.random() * Math.PI);
        }
    }

    destruct() {
        super.destruct();
    }

    getClass() {
        return ("Station");
    }

    getRadarColour() {
        return (COLOUR);
    }

    setupMesh() {
        let topThick = (BOX_HEIGHT - BAY_HEIGHT) / 2;
        let topGeom = new THREE.BoxGeometry(BOX_DEPTH, BOX_WIDTH, topThick);

        let leftThick = (BOX_WIDTH - BAY_WIDTH) / 2;
        let leftGeom = new THREE.BoxGeometry(BOX_DEPTH, leftThick, BAY_HEIGHT);

        let backThick = BOX_DEPTH - BAY_DEPTH;
        let backGeom = new THREE.BoxGeometry(backThick, BAY_WIDTH, BAY_HEIGHT);

        // compute vertex normals
        topGeom.computeVertexNormals();
        leftGeom.computeVertexNormals();
        backGeom.computeVertexNormals();

        // Central box.
        // A cube with a hole it.
        let topMesh = new THREE.Mesh(topGeom, STATION_MATERIAL);
        let botMesh = new THREE.Mesh(topGeom, STATION_MATERIAL);
        let leftMesh = new THREE.Mesh(leftGeom, STATION_MATERIAL);
        let rightMesh = new THREE.Mesh(leftGeom, STATION_MATERIAL);
        let backMesh = new THREE.Mesh(backGeom, STATION_MATERIAL);

        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        botMesh.castShadow = true;
        botMesh.receiveShadow = true;
        leftMesh.castShadow = true;
        leftMesh.receiveShadow = true;
        rightMesh.castShadow = true;
        rightMesh.receiveShadow = true;
        backMesh.castShadow = true;
        backMesh.receiveShadow = true;

        topMesh.position.set(0, 0, (BAY_HEIGHT + topThick) / 2);
        botMesh.position.set(0, 0, -((BAY_HEIGHT + topThick) / 2));
        leftMesh.position.set(0, ((BAY_WIDTH + leftThick) / 2), 0);
        rightMesh.position.set(0, -((BAY_WIDTH + leftThick) / 2), 0);
        backMesh.position.set((BOX_DEPTH - backThick) / 2, 0, 0);

        this.add(topMesh);
        this.add(botMesh);
        this.add(leftMesh);
        this.add(rightMesh);
        this.add(backMesh);

        // Landing bay.
        this.setupBay();

        // Tube
        let tubeGeom = new THREE.TorusGeometry(TORUS_RADIUS, TUBE_RADIUS);
        let tubeMesh = new THREE.Mesh(tubeGeom, STATION_MATERIAL);
        tubeMesh.castShadow = true;
        tubeMesh.receiveShadow = true;
        tubeMesh.rotateY(Math.PI / 2)

        this.add(tubeMesh);
    }

    setupBay() {
        let textureBack = this.createBayTexture(BAY_TEXTURE_SIZE, BAY_TEXTURE_SIZE, true);
        let textureSide = this.createBayTexture(BAY_TEXTURE_SIZE, BAY_TEXTURE_SIZE, false);

        // Differing textures on different internal faces.
        // I don't think this quite works as billed. However, after a lot of tinkering, the following achieves the required result.
        let materials = new Array();
        for (let i = 0; i < 6; i++) {
            let material = BAY_MATERIAL.clone();
            material.side = THREE.DoubleSide;

            if (1 != i) {
                // Most faces opaque and textured.
                if (0 == i) {
                    material.map = textureBack;
                } else {
                    material.map = textureSide;
                }
                material.transparent = false;
            } else {
                // 'Front' face is just transparent.
                material.opacity = 0;
                material.transparent = true;
            }

            material.needsUpdate = true;
            materials.push(material);
        }

        // A cube that fits, just inside, the hole in the central box.
        let bayGeom = new THREE.BoxGeometry(BAY_DEPTH - 0.5, BAY_WIDTH - 0.5, BAY_HEIGHT - 0.5);
        bayGeom.computeVertexNormals();

        this.bayMesh = new THREE.Mesh(bayGeom, materials);
        this.bayMesh.castShadow = true;
        this.bayMesh.receiveShadow = true;

        this.bayMesh.position.set(-(BOX_DEPTH - BAY_DEPTH + 1) / 2, 0, 0);

        // this.add(this.parkPoint);
        this.add(this.bayMesh);
    }

    // Get a point outside the station volume to launch ship from.
    // So it doesn't immediatly re-dock.
    getLaunchPoint() {
        let point = this.bayMesh.position.clone();
        // point.x -= BAY_DEPTH;
        point.x -= STATION_SIZE;
        return(point);
    }

    createBayTexture(width, height, isBack) {
        let text = new Texture(width, height);

        // Paint background.
        let colour = new THREE.Color('black');
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                text.setPixel(x, y, colour);
            }
        }

        // Paint lines
        colour = new THREE.Color('white');   // Allow background to show through.
        for (let x = 0; x < width; x++) {
            text.setPixel(x, 0, colour);
            if (isBack) {
                text.setPixel(x, Math.floor(height / 2), colour);
            }
            text.setPixel(x, height - 1, colour);
        }

        for (let y = 0; y <= height; y++) {
            text.setPixel(0, y, colour);
            text.setPixel(Math.floor(width / 2), y, colour);
            text.setPixel(width - 1, y, colour);
        }

        let texture = text.getTexture();
        texture.repeat.set(1, 1);

        return (texture)
    }

    doDamage(that) {
        that.takeDamage(1, this);
    }

    takeDamage(hits, that) {
        // Stations are indestructable
        return;
    }

    handleCollision(that) {
        if (that instanceof Ship) {
            return(this.collideWithShip(that));
        }

        return(super.handleCollision(that));
    }

    // Handle special case of colliding with ship.
    //
    // The station is the only significantly non-spherical Item. So some special collision handling is required.
    //
    // Return:
    //      true    If docking or, some special event occured.
    //      false   If nothing special happened and it's a regular collision.
    collideWithShip(ship) {

        // Check there really was a collision.
        // i.e is the ship's central location inside the station mesh? 
        // ToDo : Probably should be from every vertex of the ship mesh but WTF?
        let obj = this.isPointInside(ship.location);
        if (null != obj) {
            
            // If inside bay handle docking.
            if (this.bayMesh == obj) {

                // ToDo: Maybe could also check is this.parkPoint is inside ship mesh.

                // Check speed.
                if (MAX_DOCKING_SPEED < Math.floor(ship.speed.length())) {
                    this.game.displays.addMessage("Too fast! Max docking speed " + MAX_DOCKING_SPEED + " m/s");
                    return (false);
                }

                // ToDo: Check rotation speed match.

                // Dock.
                ship.dock(this);

                return (true);
            }
        } else {
            // Ship is not really inside station.
            return (true);
        }
        return (false);
    }

    animate() {
        // Spin
        this.rotateX(ROTATE_RATE / Universe.getAnimateRate());

        // Kill any momentum obtained.
        this.setSpeed(Universe.originVector);

        this.moveMesh();

        this.moveItem(true);
    }
}
export default Station;