// Base class for weapons
import { ComponentAct } from "../component.js";
import GameError from "../../../Game/gameError.js";

const DESCRIPTION = "'Weapons' are used for damaging things.\n" +
                    "If a weapon is damaged it may fail to fire."

class Weapon extends ComponentAct {
    fireRate;   // Per second
    fireLast;   // Last firing time.

    maxAmmo;    // 0 = unlimited
    ammo;       // If maxAmmo defined

    constructor(set, fireRate, maxAmmo) {
        super(set);
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
    // Return 'true' if OK to fire.
    shoot(target, date) {
        this.fireLast = date;

        if (!this.isWorking()) {
            if (this.isOn()) {
                this.set.getShip().playSound("click");
                throw (new GameError(this.getName() + " failed."));
            } else {
                return(false);
            }
        }

        if (undefined != this.maxAmmo) {
            if (0 <= this.ammo) {
                this.ammo--;
            } else {
                this.set.getShip().playSound("click");
                throw (new GameError(this.getName() + "no ammo"));
            }
        }
        return(true);
    }

    // Determine loaded and ready to fire.
    // No sure we really need this ... just shoot() and throw if it fails.
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
        heads.push("Rate(/s)");
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
        return (ship.compSets.weaponSet);
    }
}

export default Weapon;