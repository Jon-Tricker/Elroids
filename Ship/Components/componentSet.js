// Base list class for the components that make up a ship.
// Can be a set because, contain >1 instance of the same type, the individual instances are different objects..

import GameError from '../../Errors/gameError.js'

class ComponentSet extends Set {

    name;
    totalMass = 0;      // Tonnes
    slots = 0;

    constructor(name, slots) {
        super();
        this.name = name;
        this.slots = slots;
    }

    add(comp) {
        if (this.slots <= this.size) {
            throw(new GameError("No free this.slots in " + this.name + " list."));
        }
        super.add(comp)
        this.totalMass += comp.mass;
    } 
    
    delete(comp) {
        super.delete(comp)
        this.totalMass -= comp.mass;
    }

    getMass() {
        return(this.totalMass);
    }

    getSlots() {
        return(this.slots);
    }
}

export default ComponentSet;