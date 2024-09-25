// Base list class for all cargo bays.
import ComponentSet from '../componentSet.js'
import GameError from "../../../GameErrors/gameError.js"
import Mineral from "../../../GameItems/mineral.js";
import { MineralType } from '../../../GameItems/minerals.js';

class BaySet extends ComponentSet {

    // Capacity
    capacity;

    // Mineral contents
    minerals;

    // Stored compoenents. 
    components;

    // Mass of contents
    contentMass = 0;

    constructor(sets, slots) {
        super("Cargo bays", "Cargo bay", sets, slots);

        // Could be a ComponentSet. But that contains a BaySet so we get a circular depndancy.
        // Since these components are not going to be used don't need full functionality so store in a simple set.
        this.components = new ComponentSet("Components", "Component", sets);

        this.minerals = new Map();
        this.recalc();
    }

    toJSON() {
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

        return (json)
    }

    loadFromJSON(json) {

        // Unpack components.
        this.components.clear();
        for (let jsonComp of json.comps) {
            let comp = this.getGame().purchaseList.getByClass(jsonComp.class);
            comp = new comp.constructor(this.components);
            comp.status = jsonComp.status;
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

        // Ugly but minerals in not initialized when recalc called from super.constructor.
        if (undefined != this.minerals) {
            this.contentMass = 0;
            for (let [key, value] of this.minerals) {
                this.contentMass += value;
            }

            this.contentMass += this.getComponentsMass();
        }
    }

    getComponentsMass() {
        let mass = 0;
        for (let comp of this.components) {
            mass += comp.getMass();
        }
        return (mass);
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

        this.recalc();
    }

    // Dump any overspill
    level() {
        let spaceReqd = this.getContentMass() - this.capacity;
        if (0 < spaceReqd) {
            this.getGame().displays.addMessage("Bay full. Dumping surplus " + spaceReqd + "(t)");
        }

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
                return;
            }
        }

        // Not enough minerals. Dump some other cargo.
        while ((0 < this.getComponentsMass()) && (0 < (spaceReqd = this.getContentMass() - this.capacity))) {
            // Find cheapest component. 
            let cheapest = null;
            for (let comp of this.components) {
                if ((null == cheapest) || (comp.cost < cheapest.cost)) {
                    cheapest = comp;
                }
            }

            // Delete it and let it get CGed.
            spaceReqd -= cheapest.getMass();
            this.components.delete(cheapest);
        }
    }

    loadComponent(comp) {
        if (comp.mass > (this.capacity - this.getContentMass())) {
            throw (new GameError("Not enough capacity in bay."))
        }

        // If it's part of something remove it.
        if (undefined != comp.set) {
            comp.set.delete(comp);
            comp.setSet(undefined);
        }

        this.components.add(comp);

        this.recalc();

        // Dump any overspill.
        this.level();

        this.recalc();
    }

    takeDamage(hits, that) {
        super.takeDamage(hits, that);

        // If now too small dump overspill.
        this.level();
    }

    dumpMineral(mineral, mass) {
        this.unloadMineral(mineral, mass);

        // Make mineral 
        let ship = this.getShip();
        let min = new Mineral(this.sets.ship.system, mass, ship.location.x, ship.location.y, ship.location.y, ship.speed.x * Math.random(), ship.speed.y * Math.random(), ship.speed.z * Math.random(), mineral);

        min.separateFrom(ship);
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

    // Get total current mass of contents.
    getContentMass() {
        return (this.contentMass);
    }
}

export default BaySet;