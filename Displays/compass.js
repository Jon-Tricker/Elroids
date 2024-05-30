// Compass screen
import Universe from '../universe.js'
import * as THREE from 'three';
import DarkPanel from './darkPanel.js';
import Station from '../GameItems/station.js';

const SCALE = 0.05;

// Distance till blob at edge of circle.
const RANGE = 1000   // m

class Compass extends DarkPanel {
    game;
    radius;

    // Display to which we are related
    displays;

    constructor(game, ctx, defaultColour, displays) {
        super(ctx, defaultColour);
        this.game = game;
        this.displays = displays;
    }

    animate() {
        super.animate();


        this.ctx.beginPath();

        // Circle
        this.ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.radius, 0, 2 * Math.PI);
        this.ctx.stroke();

        // Find closest station.
        let stations = Station.getStationList();
        let closest = null;
        let closestRp = null;
        let thisship = this.game.ship;

        for (let station of stations) {

            let relPos = station.location.clone();

            // Handle wrap round relative to ship.
            relPos.sub(thisship.location);
            Universe.handleWrap(relPos);
            if ((null == closest) || (relPos.length() < closest.length())) {
                closest = station;
                closestRp = relPos;
            }
        }

        // Make it back relative to world and then Rotate to same angle as ship.
        closestRp.add(thisship.location);
        thisship.worldToLocal(closestRp);

        let closestRpLen = closestRp.length();

        console.log("RP " + closestRp.x + " " + closestRp.y + " " + closestRp.z);

        // Plot dot.

        // Check if behind
        let colour = "white";
        if (0 > closestRp.x) {
            colour = "red";
        }

        // Work out size
        let size = this.radius / 10;
        if (RANGE > closestRpLen) {
            size = (this.radius/2) * (RANGE - closestRpLen) / RANGE;
            if (size < this.radius / 10) {
                size = this.radius / 10;
            }
        }

        // Scale to circle.
        let pos = new THREE.Vector2(-closestRp.y, -closestRp.z);
        if (pos.length() > RANGE) {
            pos.normalize();
        } else {
            pos.divideScalar(RANGE);
        }
        pos.multiplyScalar(this.radius - size);



        this.ctx.beginPath();
        this.ctx.fillStyle = colour;

        this.ctx.arc(pos.x + this.x + this.width / 2, pos.y + this.y + this.height / 2, size, 0, 2 * Math.PI);

        this.ctx.fill();

    }

    resize(parentWidth, parentHeight) {

        this.width = parentWidth * SCALE;
        if (this.width > parentHeight / 3) {
            this.width = parentHeight / 3;
        }

        // It's square
        if (this.width > parentHeight) {
            this.width = parentHeight;
        }
        this.height = this.width;

        this.x = this.displays.radar.x - this.width;
        this.y = parentHeight - this.height;

        this.radius = (this.width - 2) / 2;
    }

}

export default Compass;