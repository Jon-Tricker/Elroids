// Details of the mineral types.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Mineral from './mineral.js'

const SPLIT_VIOLENCE = 2;

// One components of a minerals composition.
class MineralComponent {
  type;
  percentage = 0;

  constructor(type, percentage) {
    this.type = type;
    this.percentage = percentage;
  }
}

//  Array of Mineral Components specifying the composition of an Item.
class Composition {
  composition = new Array();
  colour;
  spikyness;
  facets;

  constructor(randomize) {
    if (randomize) {
      this.createRandom();
    }

    this.calculateValues();
  }

  // Create a random composition
  createRandom() {

    for (let type = 0; type < MineralTypes.length; type++) {
      let percentage = Math.floor(Math.random() * 100) * MineralTypes[type].abundance;
      this.composition.push(new MineralComponent(MineralTypes[type], percentage));
    }

    this.normalize();
  }

  // Normalize to 100%
  normalize() {
    let totalPercentage = 0;
    for (let i = 0; i < this.composition.length; i++) {
      totalPercentage += this.composition[i].percentage;
    }

    for (let i = 0; i < this.composition.length; i++) {
      this.composition[i].percentage = Math.floor(this.composition[i].percentage * 100 / totalPercentage);
    }

    for (let i = 0; i < this.composition.length; i++) {
      if (0 == this.composition[i].percentage) {
        this.composition.splice(i, 1);
      }
    }
  }

  dump(msg) {
    for (let i = 0; i < this.composition.length; i++) {
      msg += this.composition[i].percentage + " ";
    }
    console.log(msg);
  }

  // Split in a way that 'concentrates' minerals.
  // One half is modified 'this' other is a new Composition
  split() {
    // Find biggest coponent.
    let largest = 0;
    for (let i = 0; i < this.composition.length; i++) {
      if (this.composition[i].percentage >= this.composition[largest].percentage)
        largest = i;
    }

    // this.dump("was ");

    let newComp = new Composition(false);

    if (this.composition[largest].percentage >= 50) {
      // Simple new part is all the largest component
      newComp.composition.push(new MineralComponent(this.composition[largest].type, 100));
      this.composition[largest].percentage -= 50;
    } else {
      // Put as much as possible into the new part
      newComp.composition.push(new MineralComponent(this.composition[largest].type, this.composition[largest].percentage));
      this.composition[largest].percentage = 0;

      // Top up with other stuff.
      for (let j = 0; j < this.composition.length; j++) {
        if (j != largest) {
          let ratio = Math.random();
          newComp.composition.push(new MineralComponent(this.composition[j].type, this.composition[j].percentage * ratio));
          this.composition[j].percentage *= (1 - ratio);
        }
      }
    }

    // Normalize both parts.
    this.normalize();
    newComp.normalize();

    // Calculate values for both parts.
    this.calculateValues();
    newComp.calculateValues();
 
    // this.dump("old ");
    // newComp.dump("new ");

    return (newComp);
  }

  // Calculate colour, and other variables, based on the percentages.
  calculateValues() {
    let colour = new THREE.Color('black');
    this.spikyness = 0;
    this.facets = 0;

    for (let i = 0; i < this.composition.length; i++) {
      let percentage = this.composition[i].percentage / 100;

      colour.r += this.composition[i].type.colour.r * percentage;
      colour.g += this.composition[i].type.colour.g * percentage;
      colour.b += this.composition[i].type.colour.b * percentage;

      this.spikyness += this.composition[i].type.spikyness * percentage;
      this.facets += this.composition[i].type.facets * percentage;
    }

    colour.r /= this.composition.length;
    colour.g /= this.composition.length;
    colour.b /= this.composition.length;
    this.colour = new THREE.Color(colour.r, colour.g, colour.b);

    this.spikyness /= this.composition.length;
    this.facets = Math.floor(this.facets / this.composition.length);

    // console.log("xx" + this.spikyness + " " + this.facets);
  }

  // Convert into a number of Minerals.
  mineralize(location, speed, mass, game) {
    // Break down into minerals (ignore valueless).
    for (let component of this.composition) {
      if ((0 != component.type.value) && (10 < component.percentage)) {
        let newMass = mass * component.percentage/100
        if (1 <= newMass) {
          let speedRatio = Math.random();

          // Some ramdom violence based on size of impact.
          let bang = new THREE.Vector3((Math.random() * SPLIT_VIOLENCE * 2) - SPLIT_VIOLENCE, (Math.random() * SPLIT_VIOLENCE * 2) - SPLIT_VIOLENCE, Math.random() * (SPLIT_VIOLENCE * 2) - SPLIT_VIOLENCE);

          new Mineral(newMass, location.x, location.y, location.z, speed.x * speedRatio + bang.x, speed.y * speedRatio + bang.y, speed.z * speedRatio + bang.z, game, component.type);
        }
      }
    }
  }
}

class MineralType {

  name;
  colour;
  spikyness;
  facets;
  value;

  material;

  // Ammont of this (0 - 1) in the universe
  abundance;

  constructor(name, colour, spikyness, facets, abundance, value) {
    this.colour = colour;
    this.name = name;
    this.spikyness = spikyness;
    this.facets = facets;
    this.abundance = abundance;
    this.value = value;           // Cr/t

    this.material = new THREE.MeshStandardMaterial(
      {
        color: this.colour,
        roughness: 0,
        metalness: 0.8,
      })
  }

  getMaterial() {
    return (this.material);
  }
}

const MineralTypes = new Array(
  new MineralType("potch", new THREE.Color(0x808080), 0.6, 10, 1, 0),
  new MineralType("iron", new THREE.Color(0xD08000), 0.3, 15, 0.5, 20),
  new MineralType("copper", new THREE.Color(0x00D080), 0.2, 15, 0.2, 40),
  new MineralType("gold", new THREE.Color(0xFFF000), 0.3, 15, 0.05, 80),
  new MineralType("dilithium", new THREE.Color(0x0080D0), 0.8, 20, 0.03, 200),
  new MineralType("octarine", new THREE.Color(0xD000D0), 0.8, 20, 0.02, 500)
)

export { MineralType, MineralComponent, Composition, MineralTypes };