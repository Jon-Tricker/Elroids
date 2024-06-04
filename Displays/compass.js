// Compass screen
import Universe from '../universe.js'
import * as THREE from 'three';
import DarkPanel from './Utils/darkPanel.js';
import Station from '../GameItems/station.js';

const SCALE = 0.05;

// Distance till blob at edge of circle.
const RANGE = 1000   // m

class Compass extends DarkPanel {
    game;
    radius;

    constructor(game, ctx, defaultColour) {
        super(ctx, defaultColour, true);
        this.game = game;
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

        // Check if behind
        let colour = "white";
        if (0 > closestRp.x) {
            colour = "red";
        }

        // Work out dot size
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

        // Plot dot.
        this.ctx.beginPath();
        this.ctx.fillStyle = colour;
        this.ctx.arc(pos.x + this.x + this.width / 2, pos.y + this.y + this.height / 2, size, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    resize(parentWidth, parentHeight) {

        let width = parentWidth * SCALE;
        if (width > parentHeight / 4) {
            width = parentHeight / 4;
        }

        // It's square
        if (width > parentHeight) {
            width = parentHeight;
        }

        let x = this.game.displays.radar.x + this.game.displays.radar.width - width;
        let y = 0;

        super.resize(width, width, x, y);

        this.radius = (width - 2) / 2;
    }

}

export default Compass;