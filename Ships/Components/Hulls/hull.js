// Base class for hulls
//
// Also acts as a 'template' defining the initial ship component lists.
//
// Copyright (C) Jon Tricker 2023, 2025, 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import { Component, ComponentAct } from '../component.js';
import ComponentSets from '../componentSets.js';
import GameError from '../../../Game/gameError.js';
import BugError from '../../../Game/bugError.js';
import Location from '../../../Game/Utils/location.js';

const DESCRIPTION = "Each ship had one 'hull'.\n" +
    "The hull has 'slots' into which other components can be fitted.\n" +
    "The ships maximum speed in determined by it's hull type.\n" +
    "    i.e. the hull can only withstand a certain amount of stress.\n" +
    "If the hull is damage maximum speed is reduced.\n" +
    "If hull status reaches 0% the ship is destroyed.";

// Enum for locations in hull.
// undefined = centre
class HullSection {
    name;

    // Stem to stern
    static FORWARD = new HullSection("forward");
    static MIDSHIP = new HullSection("midship");
    static AFT = new HullSection("aft");

    // Side to sides
    static PORT = new HullSection("port");
    static CENTER = new HullSection("center");
    static STARBOARD = new HullSection("starboard");

    // Vertical
    static TOP = new HullSection("top");
    static MIDDLE = new HullSection("middle");
    static BOTTOM = new HullSection("bottom");

    constructor(name) {
        this.name = name;
    }
}

class EngineMesh extends THREE.Mesh {
    // Create engine material.
    static engineMaterial = new THREE.MeshStandardMaterial(
        {
            color: "#202020",
            roughness: 0.9,
            metalness: 0.1,
            side: THREE.DoubleSide,
        }
    )

    // Create flame material.
    static flameMaterial = new THREE.MeshStandardMaterial(
        {
            color: "yellow",
            roughness: 0.1,
            transparent: true,
            opacity: 0.6,
            metalness: 0.1,
            side: THREE.FrontSide,
        }
    )

    flameMesh = null;

    constructor(width, length) {
        let geometry = new THREE.ConeGeometry(width, length, 20, 1, true);
        geometry.computeVertexNormals();

        super(geometry, EngineMesh.engineMaterial);

        this.castShadow = true;
        this.receiveShadow = true;

        this.rotateZ(-Math.PI / 2);
    }

    setFlameState(state) {
        if (state) {
            if (null == this.flameMesh) {
                // Add the flame cone
                let width = this.geometry.parameters.radius;
                let height = this.geometry.parameters.height;
                let flameGeometry = new THREE.ConeGeometry(width * 0.75, height, 20, 1, false);

                // compute vertex normals
                flameGeometry.computeVertexNormals();
                let flameMesh = new THREE.Mesh(flameGeometry, EngineMesh.flameMaterial);

                // Position flame
                flameMesh.rotateZ(Math.PI);
                flameMesh.position.set(0, -height, 0);

                this.add(flameMesh);
                this.flameMesh = flameMesh;
            }
        } else {
            if (null != this.flameMesh) {
                // Remove flame.    
                this.remove(this.flameMesh)
                this.flameMesh.geometry.dispose();
                this.flameMesh = null;
            }
        }

    }
}

class Hull extends Component {

    // Sizes of this hull
    // Enbables graphics scaling. Does not effect game mechanics which is the same for all hulls.
    height;
    width;
    length;
    maxSpeed;

    shipMaterial;

    // Create base ship material.
    static baseShipMaterial = new THREE.MeshStandardMaterial(
        {
            color: "#B0B0B0",
            roughness: 0.2,
            opacity: 1,
            // map: texture,
            // roughnessMap: texture,
            // bumpMap: texture,
            metalness: 0.8,
        }
    )

    // Actual ship material.
    hullMaterial;

    // Create glass material.
    static glassMaterial = new THREE.MeshStandardMaterial(
        {
            color: "#00D0D0",
            roughness: 0,
            opacity: 0.01,
            metalness: 0,
            side: THREE.FrontSide,
        }
    )

    mesh = new THREE.Group();

    engineMeshes = new Set();

    constructor(set, maxSpeed, hullColour) {
        super(set);    // Set undefined ... will be filled in during buildSets() below.
        this.maxSpeed = maxSpeed;
        this.displayPanel = true;

        if (undefined === hullColour) {
            // Use default material
            this.shipMaterial = Hull.baseShipMaterial;
        } else {
            // Cook our own material.
            this.shipMaterial = Hull.baseShipMaterial.clone();
            this.shipMaterial.color = hullColour;
        }
    }

    setSlots(sets, hullSlots, engineSlots, weaponSlots, baySlots, avionicsSlots) {
        sets.setSlots(hullSlots, engineSlots, weaponSlots, baySlots, avionicsSlots);
        // this.set = sets.hullSet;
        // sets.hullSet.add(this);
    }

    getShipMaterial() {
        return (this.shipMaterial);
    }  
    
    getColour() {
        return (this.getShipMaterial().color);
    }

    getDescription() {
        return (DESCRIPTION);
    }

    // Get position of gun (maybe eventually one of several hardpoints.)
    getGunPoint() {
        let point = this.mesh.position.clone();
        let ship = this.getShip();

        // Slightly outside mesh.
        point.x += ship.length + 1;

        // Slightly below camera.
        point.z -= ship.height / 2;

        ship.localToWorld(point);

        let loc = new Location(point.x, point.y, point.z, ship.location.system);
        return (loc);
    }

    // Get position at which to dump stuff.
    getDumpPoint() {
        let point = this.mesh.position.clone();
        let ship = this.getShip();

        // Slightly outside mesh.
        point.x -= ship.length + 1;

        ship.localToWorld(point);

        let loc = new Location(point.x, point.y, point.z, ship.location.system);
        return (loc);
    }

    setOn(active) {
        throw new GameError("Hulls can't be de-activated.")
    }

    setFlameState(state) {
        for (let engineMesh of this.engineMeshes) {
            engineMesh.setFlameState(state);
        }
    }

    getHeadings() {
        let heads = super.getHeadings();
        heads.push("Max speed(m/s)");
        return (heads);
    }

    getValues() {
        let vals = super.getValues();
        vals.push(this.maxSpeed);
        return (vals);
    }

    unmount() {
        throw (new GameError("Can't unmount hulls."))
    }

    sell() {
        throw (new GameError("Can't sell hulls."))
    }

    getUpgradeCost(ship) {
        let oldHull = ship.hull;
        let cost = Math.floor(this.getValueInSystem(ship.system) - oldHull.getValueInSystem(ship.system)/2);

        return (cost);
    }

    getMaxSpeed() {
        return (Math.ceil(this.maxSpeed * this.status / 100));
    }

    getTargetSet(ship) {
        return (ship.compSets.hullSet);
    }

    getMesh() {
        throw new BugError("Base Hull class does not define a mesh.");
    }

    createBodyMesh() {
        throw new BugError("Base Hull class does not define a 'body' mesh.");
    }

    createCockpitMesh() {
        throw new BugError("Base Hull class does not define a 'cockpit' mesh.");
    }

    createEngineMesh(yLoc, zLoc) {
        // Add the engine cone
        let width = this.width / 4;
        if (this.height < width) {
            width = this.height;
        }

        let mesh = new EngineMesh(width, this.length);

        let y = 0;
        if (HullSection.PORT == yLoc) {
            y = this.width / 2;
        }
        if (HullSection.STARBOARD == yLoc) {
            y = -this.width / 2;
        }

        let z = 0;
        if (HullSection.TOP == zLoc) {
            z = this.height * 0.25
        }
        if (HullSection.BOTTOM == zLoc) {
            z = this.height * -0.25
        }

        mesh.position.set(-this.length * 0.25, y, z);

        // Remeber it so can add flame when required.
        this.engineMeshes.add(mesh);

        return (mesh);
    }

    createThrusterMesh(yLoc, zLoc) {
        let width = this.width / 8;
        if (this.height < width) {
            width = this.height;
        }

        let mesh = new EngineMesh(width, this.length / 4);

        // Move just inboard.
        let y = 0;
        if (HullSection.PORT == yLoc) {
            y = this.width - width * 1.1;
        }
        if (HullSection.STARBOARD == yLoc) {
            y = -this.width + width * 1.1;
        }

        // Move just down
        let z = 0;
        if (HullSection.TOP == zLoc) {
            z = this.height * 0.25
        }
        if (HullSection.BOTTOM == zLoc) {
            z = this.height * -0.25
        }

        mesh.position.set(-this.length * 0.5, y, z);

        return (mesh);
    }
}

export { Hull, HullSection };