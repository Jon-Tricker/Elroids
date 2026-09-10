// Types of goods.
import Game from "../Game/game.js";
import Goods from "./goods.js";
import GoodsSet from "./goodsSet.js";

class GoodsType {
    singular;
    plural;
    techLevel;
    magicLevel;
    mass;       // Tonnes
    cost;       // Base cost of a single unit. Credits.

    constructor(singular, plural, techLevel, magicLevel, lawLevel, mass, cost) {
        this.singular = singular;
        this.plural = plural;
        this.techLevel = techLevel;
        this.magicLevel = magicLevel;

        // Maximum law level at which legal.
        // undefined if legal everywhere.
        this.lawLevel = lawLevel;

        this.mass = mass;
        this.cost = cost;
    }

    getTechLevel() {
        return(this.techLevel);
    }

    getMagicLevel() {
        return(this.magicLevel);
    }
}

class Robot extends Goods {

    static type = new GoodsType("Robot", "Robots", 5, 0, undefined, 0.5, 200);

    getDescription() {
        return ("Your plastic pall who's fun to be with.");
    }
}

class Tool extends Goods {

    static type = new GoodsType("Tool", "Tools", 2, 0, undefined, 0.5, 50);

    getDescription() {
        return ("For fixing and stuff.");
    }
}

class Luxury extends Goods {

    static type = new GoodsType("Luxury", "Luxuries", 0, 0, undefined, 0.1, 1000);

    getDescription() {
        return ("The good stuff.");
    }
}

class Gun extends Goods {

    static type = new GoodsType("Gun", "Guns", 3, 0, 4, 0.1, 50);

    getDescription() {
        return ("For shooting things.");
    }
}

class Food extends Goods {

    static type = new GoodsType("Food", "Food", 1, 1, 7, 1, 10);

    getDescription() {
        return ("Munchie things.");
    }
}

class Narcotic extends Goods {

    static type = new GoodsType("Narcotic", "Narcotics", 1, 0, 3, 0.1, 400);

    getDescription() {
        return ("Gets you high.");
    }
}

class Crystal extends Goods {

    static type = new GoodsType("Crystal", "Crystals", 0, 2, undefined, 0.1, 500);

    getDescription() {
        return ("Basic magical component.");
    }
}


class GoodsList extends GoodsSet {

    constructor() {
        super();

        new Robot(this);
        new Tool(this);
        new Luxury(this);
        new Gun(this);
        new Food(this);
        new Narcotic(this);
        new Crystal(this);
    }
}

export { GoodsList, GoodsType };