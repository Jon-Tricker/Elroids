// Radar screen just one for the ship.
import Universe from '../universe.js'
import * as THREE from 'three';
import DarkPanel from './Utils/darkPanel.js';

const RANGE = 1500;     // m
const FLAG_SIZE = 5;

class RadarDisplay extends DarkPanel {
    game;
    showMissiles = false;

    constructor(game, ctx, defaultColour) {
        super(ctx, defaultColour, true);
        this.game = game;
    }

    animate() {
        super.animate();

        this.ctx.beginPath();

        // All the interrnals are dashed.
        this.ctx.setLineDash([4, 16]);

        // Elipse
        //this.ctx.moveTo(this.x, this.height / 2);
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

        // Check we have a working radar component.
        let radar = ship.hull.compSets.avionicsSet.getRadar();
        if ((undefined == radar) || (!radar.isWorking())) {
            return;
        }

        for (let item of this.game.universe.system.items) {

            let relPos = item.location.clone();

            // Handle wrap round relative to ship.
            relPos.sub(ship.location);
            this.game.universe.handleWrap(relPos);

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
        let y = 0;
        let width = parentWidth * 0.4;
        if (width > 2 * parentHeight) {
            width = 2 * parentHeight;
        }
        let x = (parentWidth - width) / 2;
        let height = parentHeight;

        super.resize(width, height, x, y);
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

export default RadarDisplay;