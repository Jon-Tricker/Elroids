// Items that ane not the ship
import Item from './item.js';
import Explosion from './explosion.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const MAX_ROTATION_RATE = 0.5;    // R/s

class NonShipItem extends Item {

    rotationRate;

    // Textual label (if any).
    label;

    // Unique id.
    // During the game Items are passed by reference.
    // However for save/load we need a uniqueID.
    static idCount = 0;
    myId;

    constructor(system, locationX, locationY, locationZ, speedX, speedY, speedZ, size, mass, hitPoints, owner, immobile, id) {
        super(system, locationX, locationY, locationZ, speedX, speedY, speedZ, size, mass, hitPoints, owner, immobile);
        if (undefined == id) {
            // Generate a sequential id
            this.myId = NonShipItem.idCount++;
        } else {
            this.myId = id;
        }
    }

    toJSON() {
        let json = super.toJSON();
        json.id = this.myId;
        return (json);
    }

    getId() {
        return (this.myId);
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
    // Return 'true' if destroyed.
    takeDamage(hits, that) {
        let destroyed = super.takeDamage(hits, that);
        if (destroyed) {
            new Explosion(this.size, this);
        }
        return (destroyed);
    }

    generateRotationRate() {
        let rr = Math.random() * 2 * MAX_ROTATION_RATE - MAX_ROTATION_RATE;
        return (rr);
    }

    animate() {
        let ar = this.getGame().getAnimateRate();
        this.rotateX(this.rotationRate.x / ar);
        this.rotateY(this.rotationRate.y / ar);
        this.rotateZ(this.rotationRate.z / ar);

        this.moveItem(true);
        this.moveMesh();
    }
}

export default NonShipItem;