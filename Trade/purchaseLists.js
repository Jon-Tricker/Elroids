// Shopping catalogues containing things that can be bought.
import BasicBay from "../Ship/Components/Bays/basicBay.js";
import MediumBay from "../Ship/Components/Bays/mediumBay.js";
import ComponentSets from "../Ship/Components/componentSets.js";
import GoodsSet from "./goodsSet.js";
import BasicEngine from "../Ship/Components/Engines/basicEngine.js";
import DumbMissileWeapon from "../Ship/Components/Weapons/dumbMissileWeapon.js";
import MediumEngine from "../Ship/Components/Engines/mediumEngine.js";
import BasicHull from "../Ship/Components/Hulls/basicHull.js";
import MediumHull from "../Ship/Components/Hulls/mediumHull.js";

class ComponentsList extends ComponentSets {
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
        return (this.game);
    }
}

class GoodsList extends GoodsSet {
    game;

    constructor(game) {
        super();

        this.game = game;

        // ToDo ... No trade goods yet.
    }

    getGame() {
        return (this.game);
    }

}

export {ComponentsList, GoodsList}