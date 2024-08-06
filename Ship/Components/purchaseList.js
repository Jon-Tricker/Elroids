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
    // Back reference to out parent.
    game;

    constructor(game) {
        super();

        this.game = game;

        new BasicHull(this.hullSet);
        new MediumHull(this.hullSet);
        new BasicEngine(this.engineSet);
        new MediumEngine(this.engineSet);
        new DumbMissileWeapon(this.weaponSet);
        new BasicBay(this.baySet);
        new MediumBay(this.baySet);
    }

    getGame() {
        return(this.game);
    }

}

export default PurchaseList;