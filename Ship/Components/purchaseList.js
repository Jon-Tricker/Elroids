// A shopping catalogue coantainingn all available componets.
import BasicBay from "./Bays/basicBay.js";
import MediumBay from "./Bays/mediumBay.js";
import ComponentSets from "./componentSets.js";
import BasicEngine from "./Engines/basicEngine.js";
import DumbMissileWeapon from "./Weapons/dumbMissileWeapon.js";
import MediumEngine from "./Engines/mediumEngine.js";
import BasicHull from "./Hulls/basicHull.js";
import MediumHull from "./Hulls/mediumHull.js";

class PurchaseList extends ComponentSets {

    constructor() {
        super();

        this.hullSet.add(new BasicHull());
        this.hullSet.add(new MediumHull());
        this.engineSet.add(new BasicEngine());
        this.engineSet.add(new MediumEngine());
        this.weaponSet.add(new DumbMissileWeapon());
        this.baySet.add(new BasicBay());
        this.baySet.add(new MediumBay());
    }

}

export default PurchaseList;