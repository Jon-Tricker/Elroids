// Base class for weapons
import { Component } from "../component.js";
import GameError from "../../../GameErrors/gameError.js";

const DESCRIPTION = "'Weapons' are used for damaging things."

class Weapon extends Component {
    fireRate;   // Per second
    fireLast;   // Last firing time.

    maxAmmo;    // 0 = unlimited
    ammo;       // If maxAmmo defined

    constructor(type, set, fireRate, maxAmmo) {
        super(type, set);
        this.fireRate = fireRate;
        if (undefined != maxAmmo) {
            this.maxAmmo = maxAmmo;
        }
        if (undefined != set) {
            set.recalc();
        }
    }

    getDescription() {
        return (DESCRIPTION);
    }

    // Target may be a direction or an Item.
    fire(target, date) {
        this.fireLast = date;

        if (!this.isWorking()) {
            this.set.getShip().playSound("click");
            throw (new GameError("Weapon failed"));
        }

        if (undefined != this.maxAmmo) {
            if (0 <= this.ammo) {
                this.ammo--;
            } else {
                this.set.getShip().playSound("click");
                throw (new GameError("Out of ammo"));
            }
        }
    }

    // Determine loaded and ready to fire.
    // No sur we really need this ... just fire() and throw if it fails.
    isReady(date) {
        if (undefined != this.maxAmmo) {
            if (0 == this.ammo) {
                return (false);
            }
        }

        if ((undefined == this.fireLast) || (date > this.fireLast + 1000 / this.fireRate)) {
            return (true);
        }
        return (false);
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

    getTargetSet(ship) {
        return (ship.hull.compSets.weaponSet);
    }
}

export default Weapon;