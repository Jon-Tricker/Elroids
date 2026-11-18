//  Generic compass.
import Avionic from './avionic.js';
import CompassDisplay from '../../../Displays/Components/Avionics/compassDisplay.js';

class Compass extends Avionic {    
    
    // Return the compass display panel for this component.
    getPanel(ctx, defaultColour) {
        return (new CompassDisplay(ctx, defaultColour, this));
    }
}

export default Compass;