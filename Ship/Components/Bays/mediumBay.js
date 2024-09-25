// Medium cargo bay
import { GoodsType } from '../../../Trade/goods.js';
import Bay from './bay.js'

const DESCRIPTION = "A medium sized cargo bay";

class MediumBay extends Bay {

    static type = new GoodsType("Skip", 2, 20, 500, 3);

    constructor(ship) {
        super(MediumBay.type, ship, 50);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.getName() + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default MediumBay;