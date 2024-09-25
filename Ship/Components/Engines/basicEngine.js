// Basic engine
import Engine from './engine.js'
import { GoodsType } from '../../../Trade/goods.js';


const DESCRIPTION = "A small, low thrust, engine.";

class BasicEngine extends Engine {

    static type = new GoodsType("Natphart1", 1,  5, 1000, 2,)

    constructor(set) {
        super(BasicEngine.type, set, 4000);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default BasicEngine;