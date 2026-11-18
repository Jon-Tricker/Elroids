//  Generic radar.
import Avionic from './avionic.js';
import RadarDisplay from '../../../Displays/Components/Avionics/radarDisplay.js';

class Radar extends Avionic {  

    // Return the radar display panel for this component.
    getPanel(ctx, defaultColour) {
        return (new RadarDisplay(ctx, defaultColour, this));
    }
}

export default Radar;