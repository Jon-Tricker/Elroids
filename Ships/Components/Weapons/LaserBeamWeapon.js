// Base class for laser weapon.
import BeamWeapon from './beamWeapon.js';
import LaserBeam from '../../../GameItems/Projectiles/laserBeam.js';
import { ComponentType } from '../component.js';

const FIRE_RATE = 4;

const DESCRIPTION = "A cheap weapon that fires laser beams.";

class LaserBeamWeapon extends BeamWeapon {

    static type = new ComponentType("Laser", 4, 3, 5000, 2,);

    constructor(set) {
        super(LaserBeamWeapon.type, set, FIRE_RATE);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }

    shoot(target, date) {
        if (this.isReady(date)) {
            if (super.shoot(target, date)) {
                new LaserBeam(target, this.getShip());
            }
        }
    }

}

export default LaserBeamWeapon;