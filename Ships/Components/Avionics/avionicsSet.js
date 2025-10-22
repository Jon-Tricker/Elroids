// Base list class for all avionic components.

import GameError from '../../../GameErrors/gameError.js';
import ComponentSet from '../componentSet.js';
import Radar from './radar.js';
import Compass from './compass.js';

class AvionicsSet extends ComponentSet {

    radar;          // The one and only radar.         
    compass;        // The one and only compass.

    constructor(sets, slots) {
        super("Avionics", "Avionic", sets, slots);
        this.recalc();
    }

    getRadar() {
        return(this.radar);
    } 
    
    getCompass() {
        return(this.compass);
    }

    add(comp) {
        if (comp instanceof Radar) {
            if (undefined != this.radar) {
                throw new GameError("Can only have one radar. Unmount the old one.")
            }
            this.radar = comp;
        } 
        
        if (comp instanceof Compass) {
            if (undefined != this.compass) {
                throw new GameError("Can only have one compass. Unmount the old one.")
            }
            this.compass = comp;
        }

        super.add(comp);
    }    
    
    delete(comp) {
        if (comp instanceof Radar) {
            this.radar = undefined;
        } 
        
        if (comp instanceof Compass) {
            this.compass = undefined;
        }

        super.delete(comp);
    }
}

export default AvionicsSet;