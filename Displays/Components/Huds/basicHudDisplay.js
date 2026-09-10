// Display for a basic head up display (HUD).
// 
// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Game from '../../../Game/game.js';
import HudDisplay from './hudDisplay.js';
import Projectile from '../../../GameItems/Projectiles/projectile.js';

class BasicHudDisplay extends HudDisplay {

    constructor(ctx, defaultColour, comp) {
        super(ctx, defaultColour, comp);
    } 

    animate() {
        let ctx = this.ctx;

        if (!this.comp.isWorking()) {
            return;
        }

        // Scaling is relative to parent display.
        let parent = Game.getGame().displays;
        if (parent.hudIsOn) {
            let list = this.ship.getAheadList();

            ctx.strokeRect(this.left, this.top, this.sz * 2, this.sz * 2);

            let len = this.sz / 4;
            if ((undefined === list) || (list.length == 0) || (list[0].getItem() instanceof Projectile)) {
                len /= 2;
            } 

            ctx.beginPath();
            ctx.moveTo(this.left - len, this.top - len);
            ctx.lineTo(this.left + len, this.top + len);
            ctx.moveTo(this.right + len, this.top - len);
            ctx.lineTo(this.right - len, this.top + len);
            ctx.moveTo(this.left - len, this.bottom + len);
            ctx.lineTo(this.left + len, this.bottom - len);
            ctx.moveTo(this.right + len, this.bottom + len);
            ctx.lineTo(this.right - len, this.bottom - len);

            ctx.closePath();
            ctx.stroke();
        }
    }
}

export default BasicHudDisplay;