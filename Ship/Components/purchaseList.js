// A shopping catalogue coantainingn all available componets.
import BasicBay from "./Bays/basicBay.js";
import MediumBay from "./Bays/mediumBay.js";
import ComponentSets from "./componentSets.js";
import BasicEngine from "./Engines/basicEngine.js";
import DumbMissileWeapon from "./Weapons/dumbMissileWeapon.js";

class PurchaseList extends ComponentSets {

    constructor() {
        super();

        // this.hullSet.add(new BasicHull());
        this.engineSet.add(new BasicEngine());
        this.weaponSet.add(new DumbMissileWeapon());
        this.baySet.add(new BasicBay());
        this.baySet.add(new MediumBay());
    }

}

export default PurchaseList;