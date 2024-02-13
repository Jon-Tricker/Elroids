// Base class for the components that make up a ship.

// For now ships are made of components. Other things are just 'lumps'.

class Component  {

    name;
    mass;       // Tonnes
    cost;       // Credits.

    ship;

    constructor(name, mass, cost, ship) {
        this.ship = ship;
        this.name = name;
        this.mass = mass;
        this.cost = cost;
    }
}

export default Component;