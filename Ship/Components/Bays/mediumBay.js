// Medium cargo bay
import Bay from './bay.js'

const DESCRIPTION = "A medium sized cargo bay";

class MediumBay extends Bay {

    constructor(ship) {
        super("Skip", 20, 500, 3, ship, 50);
    }

    getDescription() {
        return (super.getDescription() + "\n\n'" + this.name + "' is " + DESCRIPTION.toLowerCase());
    }
}

export default MediumBay;