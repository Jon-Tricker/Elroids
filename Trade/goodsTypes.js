// Types of goods.
import { GoodsType } from "./goods.js";
import { Goods } from "./goods.js";
import GoodsSet from "./goodsSet.js";


class Robot extends Goods {

    static type = new GoodsType ("Robots", "Robots", 2, 0, 1, 100);

    constructor(set, number) {
        super(Robot.type, set, number);
    }   
    
    getDescription() {
        return("Your plastic pall who's fun to be with.");
    }
}

class Tool extends Goods {

    static type = new GoodsType ("Tools", "Tool", 1, 0, 1, 50);

    constructor(set, number) {
        super(Tool.type, set, number);
    }   
    
    getDescription() {
        return("For fixing and stuff.");
    }
}

class Luxury extends Goods {

    static type = new GoodsType ("Luxuries", "Luxury", 0, 0, 1, 500);

    constructor(set, number) {
        super(Luxury.type, set, number);
    }   
    
    getDescription() {
        return("The good stuff.");
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
    }

    getGame() {
        return (this.game);
    }

}

export default GoodsList;