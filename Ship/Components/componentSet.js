// Base list class for the components that make up a ship.
// Can be a set because, contain >1 instance of the same type, the individual instances are different objects..

class ComponentSet extends Set {

    name;
    totalMass = 0;      // Tonnes

    constructor(name) {
        super();
        this.name = name;
    }

    add(comp) {
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
}

export default ComponentSet;