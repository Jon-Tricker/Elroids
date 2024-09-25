// Medium engine
import { GoodsType } from '../../../Trade/goods.js';
import Engine from './engine.js'

const DESCRIPTION = "Medium power engine.";

class MediumEngine extends Engine {

    static type = new GoodsType("Pootle7", 2, 10, 2000, 2);

    constructor(set) {
        super(MediumEngine.type, set, 6000);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default MediumEngine;