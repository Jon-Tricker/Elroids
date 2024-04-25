// Base class for the components that make up a ship.

// For now ships are made of components. Other things are just 'lumps'.

class Component  {

    name;
    mass;       // Tonnes
    cost;       // Credits.
    maxHp;
    status;     // % of maxHp. May result in non integer number of HPs.

    ship;

    constructor(name, mass, cost, maxHp, ship) {
        this.ship = ship;
        this.name = name;
        this.mass = mass;
        this.cost = cost;
        this.maxHp = maxHp;
        this.status = 100;
    }

    // Get ordered collumn headings.
    getHeadings() {
        let heads = new Array();
        heads.push("Name");
        heads.push("Mass(t)");
        heads.push("Cost(cr)");
        heads.push("Max HP");
        heads.push("Status(%)");

        return(heads);
    }

    getValues() {
        let vals = new Array();
        vals.push(this.name);
        vals.push(this.mass);
        vals.push(this.cost);
        vals.push(this.maxHp);
        vals.push(this.status);

        return(vals);
    } 

    getMaxHp() {
        return(this.maxHp);
    }

    // Take damage 
    // Return the amount taken.
    takeDamage(hits) {
        let dam = Math.floor(hits/this.getMaxHp() * 100);

        if (this.status < dam) {
            // Cant take full damage
            hits = this.getMaxHp() * this.status/100;
            dam = this.status;
        } 

        this.status -= dam;
        return(hits)
    }

    // Determine if working.
    isWorking() {
        return((Math.random() * 50) <= this.status);
    }
    
    getRepairCost(percent) {
        let toDo = percent;
        if (100 - this.status < percent) {
            toDo = 100 - this.status;
        }

        let cost = this.cost * toDo/100;
        return(cost);
    }

    repair(percent) {
        if (percent + this.status > 100) {
            percent = 100 - this.status;
        }

        this.status += percent;
    }
}

export default Component;