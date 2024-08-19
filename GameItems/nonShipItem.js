// Items that ane not the ship
import Item from './item.js';
import Explosion from './explosion.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const MAX_ROTATION_RATE = 0.5;    // R/s

class NonShipItem extends Item {

    // Textual label (if any).
    label;

    constructor(system, locationX, locationY, locationZ, speedX, speedY, speedZ, size, mass, hitPoints, owner, immobile) {
        super(system, locationX, locationY, locationZ, speedX, speedY, speedZ, size, mass, hitPoints, owner, immobile);
    }

    addLabel(label) {
        let labelDiv = document.createElement('div');
        labelDiv.className = 'label';
        labelDiv.textContent = label;
        // labelDiv.style.backgroundColor = '#FFFFFF';
        labelDiv.style.color = 'red';
        // labelDiv.font-family = 'sans-serif';
        // labelDiv.padding = '2px';

        this.label = new CSS2DObject(labelDiv);
        this.label.position.set(0, 0, 0);
        this.add(this.label);
        this.label.layers.set(0);
    }

    // Take damage to self.
    // Eetunn 'true' if destroyed.
    takeDamage(hits, that) {
        let destroyed = false;

        this.hitPoints -= hits;
        if (this.hitPoints <= 0) {
            new Explosion(this.size, this);

            this.destruct();
            destroyed = true;
        }
        return (destroyed);
    }

    generateRotationRate() {
        let rr = Math.random() * 2 * MAX_ROTATION_RATE - MAX_ROTATION_RATE;
        return (rr);
    }
}

export default NonShipItem;