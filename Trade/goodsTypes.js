// Types of goods.
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

    static type = new GoodsType("Robot", "Robots", 5, 0, undefined, 1, 100);

    constructor(set, number) {
        super(Robot.type, set, number);
    }

    getDescription() {
        return ("Your plastic pall who's fun to be with.");
    }
}

class Tool extends Goods {

    static type = new GoodsType("Tool", "Tools", 2, 0, undefined, 0.5, 50);

    constructor(set, number) {
        super(Tool.type, set, number);
    }

    getDescription() {
        return ("For fixing and stuff.");
    }
}

class Luxury extends Goods {

    static type = new GoodsType("Luxury", "Luxuries", 0, 0, undefined, 0.5, 500);

    constructor(set, number) {
        super(Luxury.type, set, number);
    }

    getDescription() {
        return ("The good stuff.");
    }
}

class Gun extends Goods {

    static type = new GoodsType("Gun", "Guns", 3, 0, 4, 0.5, 100);

    constructor(set, number) {
        super(Gun.type, set, number);
    }

    getDescription() {
        return ("For shooting things.");
    }
}

class Narcotic extends Goods {

    static type = new GoodsType("Narcotic", "Narcotics", 1, 0, 3, 0.5, 400);

    constructor(set, number) {
        super(Narcotic.type, set, number);
    }

    getDescription() {
        return ("Gets you high.");
    }
}

class Crystal extends Goods {

    static type = new GoodsType("Crystal", "Crystals", 0, 2, undefined, 0.1, 100);

    constructor(set, number) {
        super(Crystal.type, set, number);
    }

    getDescription() {
        return ("Basic magical component.");
    }
}


class GoodsList extends GoodsSet {
    game;

    constructor(game) {
        super();

        this.game = game;

        new Robot(this);
        new Tool(this);
        new Luxury(this);
        new Gun(this);
        new Narcotic(this);
        new Crystal(this);
    }

    getGame() {
        return (this.game);
    }
}

export { GoodsList, GoodsType };