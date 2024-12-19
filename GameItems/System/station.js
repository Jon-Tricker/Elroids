// Space station graphic and physics

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import NonShipItem from '../nonShipItem.js';
import Universe from '../../universe.js';
import Ship from '../../Ship/ship.js';
import Texture from '../../Utils/texture.js';
import BoxSides from '../../Utils/boxSides.js'
import PlateTexture from '../../Utils/plateTexture.js';


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
const TORUS_RADIUS = Math.sqrt(BOX_WIDTH * BOX_WIDTH + BOX_HEIGHT * BOX_HEIGHT) * 0.75 + TUBE_RADIUS;
const STATION_SIZE = TORUS_RADIUS + TUBE_RADIUS * 2; // m

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
        transparent: false
    }
)

const BAY_MATERIAL = new THREE.MeshStandardMaterial(
    {
        color: BAY_COLOUR,
        roughness: 0.75,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        metalness: 0.75
    }
)

class Station extends NonShipItem {

    bayMesh;

    constructor(system, locationX, locationY, locationZ, owner, json) {
        if (undefined === json) {
            super(system, locationX, locationY, locationZ, 0, 0, 0, STATION_SIZE, STATION_MASS, STATION_HP, owner, true);
        } else {
            super(system, locationX, locationY, locationZ, 0, 0, 0, STATION_SIZE, STATION_MASS, STATION_HP, owner, true, json.id);
        }

        this.setupMesh();

        if (undefined === json) {
            if (!this.getGame().testMode) {
                this.rotateX(Math.random() * Math.PI);
                this.rotateZ(Math.random() * Math.PI);
            }
        } else {
            this.rotateX(json.rotationx);
            this.rotateY(json.rotationy);
            this.rotateZ(json.rotationz);
        }

        let text = new PlateTexture().getTexture();
        STATION_MATERIAL.map = text;
        STATION_MATERIAL.bumpMap = text;
        STATION_MATERIAL.needsUpdate = true;
    }

    toJSON() {
        let json = super.toJSON();
        // json.stationSpecific = ....
        return (json);
    }

    static fromJSON(json, system) {
        let newStation = new Station(system, json.location.x, json.location.y, json.location.z, system.owner, json);
        return (newStation);
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

        topMesh.position.set(0, 0, (BAY_HEIGHT + topThick) / 2);
        botMesh.position.set(0, 0, -((BAY_HEIGHT + topThick) / 2));
        leftMesh.position.set(0, ((BAY_WIDTH + leftThick) / 2), 0);
        rightMesh.position.set(0, -((BAY_WIDTH + leftThick) / 2), 0);
        backMesh.position.set((BOX_DEPTH - backThick) / 2, 0, 0);

        this.addMesh(topMesh);
        this.addMesh(botMesh);
        this.addMesh(leftMesh);
        this.addMesh(rightMesh);
        this.addMesh(backMesh);

        // Landing bay.
        this.setupBay();

        // Torus
        let tubeGeom = new THREE.TorusGeometry(TORUS_RADIUS, TUBE_RADIUS);
        let tubeMesh = new THREE.Mesh(tubeGeom, STATION_MATERIAL);
        tubeMesh.rotateY(Math.PI / 2)
        this.addMesh(tubeMesh);

        // Tubes
        let height = TORUS_RADIUS - BOX_WIDTH / 2;

        let topTubeGeom = new THREE.CylinderGeometry(TUBE_RADIUS / 2, TUBE_RADIUS / 2, height);
        let topTubeMesh = new THREE.Mesh(topTubeGeom, STATION_MATERIAL);
        topTubeMesh.position.set(0, (height + BOX_WIDTH) / 2, 0);
        this.addMesh(topTubeMesh);

        let botTubeMesh = new THREE.Mesh(topTubeGeom, STATION_MATERIAL);
        botTubeMesh.position.set(0, -(height + BOX_WIDTH) / 2, 0);
        this.addMesh(botTubeMesh);

        height = TORUS_RADIUS - BOX_HEIGHT / 2;
        let leftTubeGeom = new THREE.CylinderGeometry(TUBE_RADIUS / 2, TUBE_RADIUS / 2, height);
        let leftTubeMesh = new THREE.Mesh(leftTubeGeom, STATION_MATERIAL);
        leftTubeMesh.rotateX(Math.PI / 2);
        leftTubeMesh.position.set(0, 0, (height + BOX_HEIGHT) / 2);
        this.addMesh(leftTubeMesh);

        let rightTubeMesh = new THREE.Mesh(leftTubeGeom, STATION_MATERIAL);
        rightTubeMesh.rotateX(Math.PI / 2);
        rightTubeMesh.position.set(0, 0, -(height + BOX_HEIGHT) / 2);
        this.addMesh(rightTubeMesh);
    }

    addMesh(mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.add(mesh);
    }

    setupBay() {

        // Differing textures on different internal faces.
        // I don't think this quite works as billed. However, after a lot of tinkering, the following achieves the required result.
        let materials = new Array();
        for (let side = 0; side < BoxSides.SIDE_COUNT; side++) {
            let material = BAY_MATERIAL.clone();
            material.side = THREE.DoubleSide;

            let texture;
            if (side != BoxSides.BACK) {
                // Most faces opaque and textured.
                texture = this.createBayTexture(BAY_TEXTURE_SIZE, BAY_TEXTURE_SIZE, side);
                material.map = texture;
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
        let bayGeom = new THREE.BoxGeometry(BAY_DEPTH - 1, BAY_WIDTH - 1, BAY_HEIGHT - 1);
        bayGeom.computeVertexNormals();

        this.bayMesh = new THREE.Mesh(bayGeom, materials);

        this.bayMesh.position.set(-(BOX_DEPTH - BAY_DEPTH + 1) / 2, 0, 0);

        // this.add(this.parkPoint);
        this.addMesh(this.bayMesh);
    }

    // Get a point outside the station volume to launch ship from.
    // So it doesn't immediatly re-dock.
    getLaunchPoint() {
        let point = this.bayMesh.position.clone();
        // point.x -= BAY_DEPTH;
        point.x -= STATION_SIZE;
        return (point);
    }

    createBayTexture(width, height, side) {
        let baseCol = new THREE.Color('black');
        switch (side) {
            case BoxSides.BOTTOM:
                baseCol = new THREE.Color('darkGrey');
                break;

            case BoxSides.TOP:
                baseCol = new THREE.Color('lightGrey');
                break;

            default:
                break;
        }

        let text = new Texture(width, height, baseCol);


        // Paint edgelines
        let whiteCol = new THREE.Color('white');   // Allow background to show through.
        for (let x = 0; x < width; x++) {
            text.setPixel(x, 0, whiteCol);
            text.setPixel(x, height - 1, whiteCol);
        }
        for (let y = 0; y <= height; y++) {
            text.setPixel(0, y, whiteCol);
            text.setPixel(width - 1, y, whiteCol);
        }

        // Paint guide lines.   
        let redCol = new THREE.Color('red');
        let greenCol = new THREE.Color('green');
        let col = null;
        switch (side) {
            case BoxSides.FRONT:
                col = whiteCol;
                break;

            case BoxSides.BACK:
            case BoxSides.LEFT:
            case BoxSides.RIGHT:
            default:
                break
        }

        if (null != col) {
            for (let x = 0; x < width; x++) {
                text.setPixel(x, Math.floor(height / 2), col);
            }
        }

        col = null;
        switch (side) {
            case BoxSides.FRONT:
            case BoxSides.TOP:
                //case BoxSides.BOTTOM:
                col = whiteCol;
                break;

            case BoxSides.BACK:
                break;

            // Left and right are swaped when looking at the inside of a box.
            case BoxSides.RIGHT:
                col = redCol;
                break;
            case BoxSides.LEFT:
                col = greenCol;
                break;

            default:
                break
        }

        if (null != col) {
            for (let y = 0; y <= height - 1; y++) {
                text.setPixel(Math.floor(width / 2), y, col);
            }
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
            return (this.collideWithShip(that));
        }

        return (super.handleCollision(that));
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
                    this.getGame().displays.addMessage("Too fast! Max docking speed " + MAX_DOCKING_SPEED + " m/s");
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
        this.rotateX(ROTATE_RATE / this.getGame().getAnimateRate());

        // Kill any momentum obtained.
        this.setSpeed(Universe.originVector);

        this.moveMesh();

        this.moveItem(true);
    }
}
export default Station;