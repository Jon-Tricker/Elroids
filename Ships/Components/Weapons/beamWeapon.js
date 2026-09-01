// Base class for beam weapons
// For now the mechanics of launching beams and missiles is the same.

import MissileWeapon from "./missileWeapon.js";

const DESCRIPTION = "'Beam weapons' fire energy beams.\n" +
                    "Beams are faster but have shorter range than 'missiles'."

class BeamWeapon extends MissileWeapon {
    
    getDescription() {
        return (super.getDescription() + "\n\n" + DESCRIPTION);
    }
}

export default BeamWeapon;