// Non player ship graphic and physics.
// Minumum necessary implemented.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Ship from '../ship.js';
import Mineral from "../../GameItems/mineral.js";
import Station from '../../GameItems/System/station.js';
import WormholeEnd from '../../GameItems/System/wormholeEnd.js';
import GoodsCrate from '../../Trade/goodsCrate.js';
import ComponentSets from '../Components/componentSets.js';


class NPShip extends Ship {

    // Brain of NP ship.
    ai;

    // Minimal components set
    components;

    constructor(system, height, width, length, location, hull, mass, hitPoints) {
        super(system, height, width, length, location, mass, hitPoints);
        this.components = new ComponentSets(this, 1, 0, 0 ,0, 0);
        this.hull = new hull(this.components.hullSet);
    }

    animate(date, keyboard) {
        this.ai.animate(date);
        super.animate(date);
    }

    takeDamage(hits, that) {
        let destroyed = super.takeDamage(hits, that);
        if (destroyed) {
            // Spawn some junk        
        }
        return(destroyed);
    }



    handleCollision(that) {
        if (that instanceof Mineral) {
            return (this.mineralPickup(that));
        }

        if (that instanceof GoodsCrate) {
            return (this.cratePickup(that));
        }

        if (that instanceof Station) {
            if (that.collideWithShip(this)) {
                return;
            }
        }

        if (that instanceof WormholeEnd) {
            // Do not try to traverse wormhole.
            // Will end up unanimated on far side.
            this.destruct();
            return;
        }

        return (super.handleCollision(that));
    }

}

export default NPShip;