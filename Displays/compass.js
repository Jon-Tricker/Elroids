// Compass screen
import * as THREE from 'three';
import DarkPanel from './Utils/darkPanel.js';

const SCALE = 0.05;

// Distance till blob at edge of circle.
const RANGE = 1000;   // m 

// Dot colours
const STA_FRONT_COL = "white";
const STA_REAR_COL = "red";
const WH_FRONT_COL = "cyan";
const WH_REAR_COL = "yellow";

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

        let thisship = this.getShip();

        if (null != thisship.dockedWith) {
            return;
        }

        // List of dots
        let dots = new Array();

        // Populate dots. 
        this.addDots(dots, this.game.universe.system.getStations(), STA_FRONT_COL, STA_REAR_COL);
        this.addDots(dots, this.game.universe.system.getWormholes(), WH_FRONT_COL, WH_REAR_COL);

        // Sort dots into size order. Largest first.
        dots.sort(function(a, b){return b.size - a.size});

        // Plot dots.
        for (let dot of dots) {
            this.ctx.beginPath();
            this.ctx.fillStyle = dot.colour;
            this.ctx.arc(dot.x + this.x + this.width / 2, dot.y + this.y + this.height / 2, dot.size, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    // Make dots for a class of Items. For now just does the closest Item.
    addDots(dots, items, frontColour, rearColour) {
        let thisship = this.getShip();

        // Find closest object in set.
        let closest = null;
        let closestRp = null;

        for (let item of items) {
            let relPos = item.location.clone();

            // Handle wrap round relative to ship.
            relPos.sub(thisship.location);
            this.game.universe.handleWrap(relPos);
            if ((null == closest) || (relPos.length() < closest.length())) {
                closest = item;
                closestRp = relPos;
            }
        }

        if (null == closest) {
            return;
        }

        // Make it back relative to world and then Rotate to same angle as ship.
        closestRp.add(thisship.location);
        thisship.worldToLocal(closestRp);

        let closestRpLen = closestRp.length();

        // Check if behind
        let colour = frontColour;
        if (0 > closestRp.x) {
            colour = rearColour;
        }

        // Work out dot size
        let size = this.radius / 10;
        if (RANGE > closestRpLen) {
            size = (this.radius / 2) * (RANGE - closestRpLen) / RANGE;
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

        // Make dot.
        let dot = new Dot(pos.x, pos.y, size, colour);
        dots.push(dot);

        return;
    }

    getShip() {
        return (this.game.universe.system.ship);
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

// A single compass dot.
class Dot {
    x;
    y;
    size;
    colour;

    constructor(x, y, size, colour) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.colour = colour;
    }
}

export default Compass;