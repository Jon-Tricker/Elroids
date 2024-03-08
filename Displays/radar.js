// Radar screen
import Universe from '../universe.js'
import * as THREE from 'three';
import DarkPanel from './darkPanel.js';

const RANGE = 1500;     // m
const FLAG_SIZE = 5;

class Radar extends DarkPanel {
    game;

    constructor(game, ctx, defaultColour) {
        super(ctx, defaultColour);
        this.game = game;
    }

    animate() {
        super.animate();

        // All the interrnals are dashed.
        this.ctx.setLineDash([4, 16]);

        // Elipse
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.height / 2);

        // Top curve
        // this.ctx.bezierCurveTo(this.x, 0, this.x + this.width, 0, this.x + this.width, this.height / 2);

        // Bottom curve
        // this.ctx.bezierCurveTo(this.x + this.width, this.height, this.x, this.height, this.x, this.height / 2);

        // Horizontal lines
        for (let count = 1; count < 4; count++) {
            this.ctx.moveTo(this.x, this.y + (this.height / 4) * count);
            this.ctx.lineTo(this.x + this.width, this.y + (this.height / 4) * count);
        }

        // Vertical lines
        for (let count = 0; count < 5; count++) {
            this.ctx.moveTo(this.x + (this.width / 8) * (count + 2), this.y);
            this.ctx.lineTo(this.x + (this.width / 4) * count, this.y + this.height);
        }
        this.ctx.moveTo(this.x + (this.width / 8), this.y);
        this.ctx.lineTo(this.x, this.y + this.height / 4);
        this.ctx.moveTo(this.x + (this.width / 8) * 7, this.y);
        this.ctx.lineTo(this.x + this.width, this.y + this.height / 4);

        this.ctx.stroke();

        // No longer dashed
        this.ctx.setLineDash([]);

        let ship = this.game.getShip();

        for (let item of Universe.itemList) {

            let relPos = item.location.clone();

            // Handle wrap round relative to ship.
            relPos.sub(ship.location);
            Universe.handleWrap(relPos);

            // if not out of range.
            if (relPos.length() < RANGE) {
                let colour = item.getRadarColour();

                if (null != colour) {
                    // Make it back relative to world and then Rotate to same angle as ship.
                    relPos.add(ship.location);
                    ship.worldToLocal(relPos);

                    let basePos = relPos.clone();
                    basePos.z = 0;

                    // Scale by x ... attempt at proper perspective.
                    // Doesn't really work because front, most important, arc becomes smallest.
                    /*
                    let scaleFactor = 1 + (RANGE + relPos.x); 
                    if (scaleFactor != 0) {
                        scaleFactor = RANGE/scaleFactor;
                    }
                    */

                    // For now scale so max range at edge of box.
                    let maxDim = this.width;
                    if (this.height > maxDim) {
                        maxDim = this.height;
                    }
                    let scaleFactor = maxDim / (RANGE * 2);

                    relPos.multiplyScalar(scaleFactor);
                    basePos.multiplyScalar(scaleFactor);


                    // Move y down by scaled z
                    // basePos.x = relPos.x - relPos.z;
                    relPos.x = relPos.x + relPos.z;

                    // Convert window to screen positions.
                    if (!this.toScreen(relPos)) {
                        continue;
                    }
                    if (!this.toScreen(basePos)) {
                        continue;
                    }

                    // Plot it.
                    this.ctx.fillStyle = colour;
                    this.ctx.strokeStyle = colour;
                    this.ctx.beginPath();
                    this.ctx.fillRect(relPos.x, relPos.y, FLAG_SIZE, FLAG_SIZE);

                    this.ctx.moveTo(basePos.x, basePos.y);
                    this.ctx.lineTo(relPos.x, relPos.y);
                    this.ctx.stroke();

                    this.ctx.fillStyle = this.defaultColour;
                    this.ctx.strokeStyle = this.defaultColour;
                }
            }
        }
    }

    resize(parentWidth, parentHeight) {
        this.y = 0;
        this.width = parentWidth * 0.4;
        if (this.width > 2 * parentHeight) {
            this.width = 2 * parentHeight;
        }
        this.x = (parentWidth - this.width) / 2;
        this.height = parentHeight;
    }

    // Convert relative to screen.
    toScreen(ip) {
        // Ship is alligned on the x axis but 'infront' on radar is the vertical (y) axis ... swap.
        let temp = ip.x;
        ip.x = -ip.y;
        ip.y = -temp;

        // Distort so equal amount of siastace in both directions.
        if (this.height > this.width) {
            ip.x *= this.width / this.height;
        } else {
            ip.y *= this.height / this.width;
        }

        // x and y offsets.
        ip.x += this.x + this.width / 2;
        ip.y += this.y + this.height / 2;


        if ((ip.x < FLAG_SIZE) || (ip.x > this.width + this.x)) {
            return (false)
        }

        if ((ip.y < FLAG_SIZE) || (ip.y > this.height)) {
            return (false)
        }

        return (true);
    }
}

export default Radar;