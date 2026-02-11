// Base list class for all cargo bays.
import * as THREE from 'three';
import ComponentSet from '../componentSet.js'
import GameError from "../../../Game/gameError.js"
import Mineral from "../../../GameItems/mineral.js";
import { MineralType } from '../../../GameItems/minerals.js';
import GoodsSet from '../../../Trade/goodsSet.js';
import { Component } from '../component.js';
import BugError from '../../../Game/bugError.js';
import { MineralTypes } from '../../../GameItems/minerals.js';
import PlayerShip from '../../playerShip.js';

class BaySet extends ComponentSet {

    // Cached values
    contentMass;
    capacity;

    // Stored stuff.
    minerals;
    components;

    // Trade goods are stored in a map with:
    //   Key = An instance of the good in the catalog.
    //   Value = The number of the good.
    tradeGoods;

    constructor(sets, slots) {
        super("Cargo bays", "Cargo bay", sets, slots);

        this.components = new ComponentSet("Components", "Component", sets);

        this.minerals = new Map();

        this.tradeGoods = new GoodsSet("Trade goods", "Trade good", sets);

        this.recalc();
    }

    cargoToJSON() {
        let json = {};

        let jsonMinerals = [];
        for (let [key, value] of this.minerals) {
            jsonMinerals.push({
                name: key.name,
                mass: value
            })
        }
        json.minerals = jsonMinerals;

        json.comps = this.components.toJSON();

        json.goods = this.tradeGoods.toJSON();

        return (json)
    }

    loadFromJSON(json) {

        // Unpack components.
        this.components.clear();
        for (let jsonComp of json.comps) {
            let comp = this.getGame().componentsList.getByClass(jsonComp.class);
            comp = new comp.constructor(this.components);
            comp.status = jsonComp.status;
        }

        // Unpack goods  
        this.tradeGoods.clear();
        for (let jsonGood of json.goods) {
            let good = this.getGame().goodsList.getByClass(jsonGood.class);
            good = new good.constructor(this.tradeGoods, jsonGood.number);
        }

        // Unpack minerals.
        this.minerals = new Map();
        for (let jsonMineral of json.minerals) {
            let mineral = MineralType.getByName(jsonMineral.name);
            this.loadMineral(mineral, jsonMineral.mass);
        }

        this.recalc();
    }

    recalc() {
        super.recalc();

        this.capacity = 0;
        for (let bay of this) {
            this.capacity += bay.getCapacity();
        }

        this.contentMass = 0;
        this.contentMass += this.components.getMass();

        // Ugly but minerals in not initialized when recalc called from super.constructor.
        if (undefined != this.minerals) {
            for (let [key, value] of this.minerals) {
                this.contentMass += value;
            }
        }

        this.contentMass += this.tradeGoods.getMass();
    }

    getTotalMass() {
        return (this.mass + this.getContentMass());
    }

    // Get total current mass of contents.
    getContentMass() {
        return (this.contentMass);
    }

    getCapacity() {
        return (this.capacity);
    }

    getAvailableCapacity() {
        return (this.getCapacity() - this.getContentMass());
    }

    loadMineral(mineral, mass) {

        // Load it all.
        if (this.minerals.has(mineral)) {
            // Update entry for this mineral type.
            this.minerals.set(mineral, this.minerals.get(mineral) + mass)
        } else {
            // Create entry for this mineral type.
            this.minerals.set(mineral, mass);
        }

        this.recalc();

        // Dump any overspill.
        this.level();
    }

    loadGoods(goods) {
        /*
        if (goods.getMass() > this.getAvailableCapacity()) {
            throw (new GameError("Not enough capacity in bay."))
        }
        */

        if (goods instanceof Component) {
            // If it's part of something remove it.
            if (undefined != goods.set) {
                goods.set.delete(goods);
                goods.setSet(undefined);
            }

            this.components.add(goods);
            goods.setSet(this.components);
        } else {
            let existing = this.tradeGoods.getByType(goods.type);

            if (null != existing) {
                // Already present. Tncrease number.
                existing.number += goods.number;
                this.tradeGoods.recalc();
                // ... Passed object no longer needed ... allow it go out of scope.
            } else {
                // Not present. Add to list.
                this.tradeGoods.add(goods);
                goods.setSet(this.tradeGoods);
            }
        }

        // Dump any overspill.
        this.level();
    }

    // Empty everything
    empty() {
        for (let comp of this.components) {
            this.components.delete(comp);
        }
        
        for (let goods of this.tradeGoods) {
            this.tradeGoods.delete(goods);
        }

        for (const [mineral, mass] of this.minerals) {
            this.minerals.delete(mineral);
        }

        this.recalc();
    }

    unloadGoods(goods, number) {
        if (goods instanceof Component) {
            if (!this.components.has(goods)) {
                throw (new BugError("Bay does not contain " + goods));
            }
            this.components.delete(goods);
            this.components.recalc();
        } else {
            // Reduce count.
            let existing = this.tradeGoods.getByType(goods.type);
            if (null == existing) {
                throw (new BugError("Bay does not contain " + existing));
            }

            // Reduce number.
            existing.number -= number;
            if (0 >= existing.number) {
                // Remove from list.
                this.tradeGoods.delete(existing);
            }
            this.tradeGoods.recalc();
        }

        // No need to level on unload.
        this.recalc();
    }

    // Dump any overspill
    level() {
        this.recalc();

        let spaceReqd = this.getContentMass() - this.capacity;
        if (0 < spaceReqd) {
            if (this.getShip() instanceof PlayerShip) {
                this.getGame().displays.addMessage("Bay full. Dumping surplus " + spaceReqd + "(t)");
            }
        }

        // First dump minerals
        while ((this.minerals.size > 0) && (0 < (spaceReqd = this.getContentMass() - this.capacity))) {
            // Find cheapest
            let cheapest = null;
            let cost = null;
            for (let [key, value] of this.minerals) {
                if ((null == cost) || (key.value < cost)) {
                    cheapest = key;
                    cost = key.value;
                }
            }

            if (this.minerals.get(cheapest) < spaceReqd) {
                // Not enough.
                spaceReqd -= this.minerals.get(cheapest);
                this.dumpMineral(cheapest, this.minerals.get(cheapest));
            } else {
                // Enough. Dump and give up
                this.dumpMineral(cheapest, spaceReqd)
                this.recalc();
                return;
            }
        }

        // Not enough minerals. Dump other cargo.
        while ((0 < (this.components.getMass() + this.tradeGoods.getMass())) && (0 < (spaceReqd = this.getContentMass() - this.capacity))) {
            // Find cheapest component. 
            let cheapest = null;
            for (let comp of this.components) {
                if ((null == cheapest) || (comp.getCost() < cheapest.getCost())) {
                    cheapest = comp;
                }
            }

            for (let goods of this.tradeGoods) {
                if ((null == cheapest) || (goods.getCost() < cheapest.getCost())) {
                    cheapest = goods;
                }
            }

            // Work out how many to dump.
            let dumpNumber = cheapest.getNumber();
            if (spaceReqd < cheapest.getMass()) {
                // Do partial dump
                dumpNumber = Math.ceil(spaceReqd / (cheapest.getMass() / cheapest.getNumber()));
            }

            // Delete it.
            spaceReqd -= cheapest.getMass() * dumpNumber;
            this.dumpGoods(cheapest, dumpNumber);
        }

        this.recalc();
    }

    takeDamage(hits, that) {
        super.takeDamage(hits, that);

        // If now too small dump overspill.
        this.level();
    }

    dumpMineral(mineral, mass) {
        if (undefined === mass) {
            // Dump it all
            mass = this.minerals.get(mineral);
        }

        this.unloadMineral(mineral, mass);

        // Make mineral 
        let ship = this.getShip();
        let shipLoc = ship.getLocation();
        let min = new Mineral(mass, shipLoc, new THREE.Vector3(ship.speed.x * Math.random(), ship.speed.y * Math.random(), ship.speed.z * Math.random()), mineral);
        min.setActive(true);

        min.separateFrom(ship);

        this.recalc();
    }

    dumpGoods(goods, number) {

        if (undefined === number) {
            // Dump them all
            number = goods.getNumber();
        }

        // Take out of bay.
        this.unloadGoods(goods, number);

        // Make goods crate, 
        let ship = this.getShip();
        let good = new goods.constructor();
        good.number = number;

        let shipLoc = ship.getLocation();
        let crate = good.makeCrate(shipLoc, new THREE.Vector3(ship.speed.x * Math.random(), ship.speed.y * Math.random(), ship.speed.z * Math.random()));

        crate.separateFrom(ship);

        this.recalc();
    }

    dumpAll() {
        for (let good of this.tradeGoods) {
            this.dumpGoods(good);
        }

        for (let [mineral, mass] of this.minerals) {
            this.dumpMineral(mineral);
        }
    }

    // Load random cargo up to a given value.
    loadRandomCargo(value) {
        while (value > 10) {
            let cost = Math.floor(value * Math.random());
            value -= cost;

            switch (Math.floor(Math.random() * 4)) {
                case 0:
                    // Make mineral
                    let type = MineralTypes[1 + Math.floor(Math.random() * (MineralTypes.length - 1))];
                    let mass = Math.ceil(cost / type.value);
                    this.loadMineral(type, mass);
                    break;

                case 1:
                    // Make goods.
                    let good = new (this.getGame().goodsList.getRandomElement()).constructor();
                    good.number = Math.ceil(cost / good.type.cost);
                    this.loadGoods(good);
                    break;

                case 2:
                    // Todo make component.
                    break;

                default:
                    // Don't make anything.
                    break;
            }
        }
    }

    // Unload a mineral.
    // Return amount unloaded.
    unloadMineral(mineral, mass) {
        // Deduct from cargo.
        if (!this.minerals.has(mineral)) {
            throw (new GameError("No such mineral in bay."))
        }

        let available = this.minerals.get(mineral);
        if (available < mass) {
            mass = available;
        }

        // Update entry for this mineral type.
        this.minerals.set(mineral, available - mass)

        // If 0 remaining delete entry.
        if (0 == this.minerals.get(mineral)) {
            this.minerals.delete(mineral);
        }

        this.recalc();

        return (mass);
    }

}

export default BaySet;