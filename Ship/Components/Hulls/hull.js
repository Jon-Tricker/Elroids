// Base class for hulls
//
// Also acts as a 'temlate' defining the initial ship component lists.
//
// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Component from '../component.js'
import HullSet from '../Hulls/hullSet.js';
import ComponentSets from '../componentSets.js';

const DESCRIPTION = "Each ship had one 'hull'.\n" +
                    "The hull has 'slots' into which other components can be fitted.\n" +
                    "The ships maximum speed in determined by it's hull type.\n" +
                    "    i.e. the hull can only withstand a certain amount of stress.\n" +
                    "If the hull is damage maximum speed is reduced.\n" +
                    "If hull status reaches 0% the ship is destroyed.";


class Hull extends Component {

    flameMaterial;

    // Create ship material.
    static shipMaterial = new THREE.MeshStandardMaterial(
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
    
    // Create engine material.
    static engineMaterial = new THREE.MeshStandardMaterial(
        {
            color: "#202020",
            //color: "#ffffff",
            roughness: 0.9,
            opacity: 1,
            // map: texture,
            // roughnessMap: texture,
            // bumpMap: texture,
            metalness: 0.1,
            side: THREE.DoubleSide,
        }
    )
    
    // Create flame material.
    static baseFlameMaterial = new THREE.MeshStandardMaterial(
        {
            // TODO ... Seems to loose the color when made transparent.
            color: "yellow",
            roughness: 0.9,
    
            // Full transprent when off.
            transparent: true,
            opacity: 0,
    
            // map: texture,
            // roughnessMap: texture,
            // bumpMap: texture,
            metalness: 0.1,
        }
    )

    ramDamage;
    maxSpeed;

    mesh = new THREE.Group();

    constructor(name, mass, cost, maxHp, ship, ramDamage, maxSpeed) {
        super(name, mass, cost, maxHp, ship);
        this.ramDamage = ramDamage;
        this.maxSpeed = maxSpeed;
        this.flameMaterial = Hull.baseFlameMaterial.clone();
        this.displayPanel = true;
        this.buildShip();
    }

    getDescription() {
        return (DESCRIPTION);
    }

    // Build a ship for this hull type.
    buildShip() {
        // All hulls have a single HullSet slot for themself.
        this.ship.hullSet = new HullSet(this.ship, 1);
        this.ship.hullSet.add(this); 

        // Build set of all componets sets.
        // Order effects order in which component display panels are displayed.
        this.ship.compSets = new ComponentSets();
        this.ship.compSets.add(this.ship.hullSet);
        this.ship.compSets.add(this.ship.engineSet);
        this.ship.compSets.add(this.ship.weaponSet);
        this.ship.compSets.add(this.ship.baySet);
    }

    setFlameState(state) {
        if (state) {
            if (this.flameMaterial.transparent) {
                this.flameMaterial.transparent = false;
                this.flameMaterial.opacity = 1;
                //this.flameMaterial.needsUpdate = true;
            }
        } else {
            if (!this.flameMaterial.transparent) {
                this.flameMaterial.transparent = true;
                this.flameMaterial.opacity = 0;
                // this.flameMaterial.needsUpdate = true;
            }
        }
    }

    getHeadings() {
        let heads = super.getHeadings();
        heads.push("Ram damage(HP)");
        heads.push("Max speed(m/s)");
        return(heads);
    }

    getValues() {
        let vals = super.getValues();
        vals.push(this.ramDamage);
        vals.push(this.maxSpeed);
        return(vals);
    }

    getMaxSpeed() {
        return (Math.ceil(this.maxSpeed * this.status/100));
    }
}

export default Hull;