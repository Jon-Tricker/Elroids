// Base class for the components that make up a ship.

// For now ships are made of components. Other things are just 'lumps'.

class Component  {

    name;
    mass;       // Tonnes
    cost;       // Credits.
    status;     // %

    ship;

    constructor(name, mass, cost, ship) {
        this.ship = ship;
        this.name = name;
        this.mass = mass;
        this.cost = cost;
        this.status = 100;
    }

    // Get ordered collumn headings.
    getHeadings() {
        let heads = new Array();
        heads.push("Name");
        heads.push("Mass(t)");
        heads.push("Cost(cr)");
        heads.push("Status(%)");

        return(heads);
    }

    getValues() {
        let vals = new Array();
        vals.push(this.name);
        vals.push(this.mass);
        vals.push(this.cost);
        vals.push(this.status);

        return(vals);
    }
}

export default Component;