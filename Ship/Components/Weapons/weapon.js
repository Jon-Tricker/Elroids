// Base class for weapons
import Universe from '../../../universe.js';
import Component from '../component.js';

class Weapon extends Component {
    fireRate;   // Per second
    fireLast = Universe.getTime();

    maxAmmo;    // 0 = unlimited
    ammo;       // If maxAmmo defined

    constructor(name, mass, cost, ship, fireRate, maxAmmo) {
        super(name, mass, cost, ship);
        this.fireRate = fireRate;
        if (undefined != maxAmmo) {
            this.maxAmmo = maxAmmo;
        }
    }

    // Target may be a direction or an Item.
    fire(target, date) {
        if (undefined != this.maxAmmo) {
            if (0 < this.ammo) {
                this.ammo--;
            } else {
                throw (GameError("Out of ammo"));
            }
        }
        this.fireLast = date;
    }

    // Determine loaded and ready to fire.
    // No sur we really need this ... just fire() and throw if it fails.
    isReady(date) {
        if (undefined != this.maxAmmo) {
            if (0 == this.ammo) {
                return(false);
            }
        }

        if (date > this.fireLast + 1000 / this.fireRate) {
            return(true);
        }
        return(false);
    }

    getHeadings() {
        let heads = super.getHeadings();
        heads.push("Fire rate(/s)");
        heads.push("Max ammo");
        if (undefined != this.maxAmmo) {
            heads.push("Ammo");
        }
        return (heads);
    }

    getValues() {
        let vals = super.getValues();
        vals.push(this.fireRate);
        if (undefined == this.maxAmmo) {
            vals.push("Unlimited");
        } else {
            vals.push(this.maxAmmo);
            vals.push(this.ammo);

        }
        return (vals);
    }
}

export default Weapon;