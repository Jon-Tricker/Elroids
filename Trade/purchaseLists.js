// Shopping catalogues containing things that can be bought.
import BasicBay from "../Ships/Components/Bays/basicBay.js";
import MediumBay from "../Ships/Components/Bays/mediumBay.js";
import ComponentSets from "../Ships/Components/componentSets.js";
import BasicEngine from "../Ships/Components/Engines/basicEngine.js";
import BasicRadar from "../Ships/Components/Avionics/basicRadar.js";
import BasicCompass from "../Ships/Components/Avionics/basicCompass.js";
import DumbMissileWeapon from "../Ships/Components/Weapons/dumbMissileWeapon.js";
import MediumEngine from "../Ships/Components/Engines/mediumEngine.js";
import BasicHull from "../Ships/Components/Hulls/basicHull.js";
import MediumHull from "../Ships/Components/Hulls/mediumHull.js";
import LargeHull from "../Ships/Components/Hulls/largeHull.js";

class ComponentsList extends ComponentSets {
    game;

    constructor(game) {
        super();

        this.game = game;

        new BasicHull(this.hullSet);
        new MediumHull(this.hullSet);
        new LargeHull(this.hullSet);
        new BasicEngine(this.engineSet);
        new MediumEngine(this.engineSet);
        new DumbMissileWeapon(this.weaponSet);
        new BasicBay(this.baySet);
        new MediumBay(this.baySet);
        new BasicRadar(this.avionicsSet);
        new BasicCompass(this.avionicsSet);
    }

    getGame() {
        return (this.game);
    }
}

export {ComponentsList}