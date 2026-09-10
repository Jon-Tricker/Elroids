// Root class for head up display (HUD) displays.
// 
// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html
import Game from '../../../Game/game.js';
import Panel from '../../Utils/panel.js';

class HudDisplay extends Panel {
    ship;
    comp;

    left;
    top;
    right;
    bottom;
    sz;         // Size of basic HUD.
    txtSz;

    constructor(ctx, defaultColour, comp) {
        super(ctx, defaultColour, true);
        this.ship = Game.getGame().getShip();
        this.comp = comp;
    }

    resize(width, height, x, y) {
        super.resize(width, height, x, y);

        this.sz = height;
        if (width < height) {
            this.sz = width;
        }
        this.sz *= 0.05;     
        this.txtSz = this.sz;       
        
        this.left = this.width / 2 - this.sz;
        this.top = this.height / 2 - this.sz;
        this.right = this.left + this.sz * 2;
        this.bottom = this.top + this.sz * 2;
    }

    printNum(num) {
        return (Game.getGame().displays.printNum(num));
    }
}

export default HudDisplay;