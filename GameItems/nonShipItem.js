// All litems that ane not the ship
import Item from './item.js';
import Explosion from './explosion.js'

class NonShipItem extends Item{

    constructor(locationX, locationY, locationZ, speedX, speedY, speedZ, game, size, mass, hitPoints, owner) {
        super(locationX, locationY, locationZ, speedX, speedY, speedZ, game, size, mass, hitPoints, owner);
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
        return(destroyed);
    }

   
}

export default NonShipItem;