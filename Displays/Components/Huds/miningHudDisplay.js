// Display for mining (HUD).
// 
// Copyright (C) Jon Tricker 2023, 2025.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import HudDisplay from './hudDisplay.js';
import TextPanel from '../../Utils/textPanel.js';
import Rock from '../../../GameItems/rock.js';

class MiningHudDisplay extends HudDisplay {

    txt;

    constructor(game, ctx, defaultColour, comp) {
        super(game, ctx, defaultColour, comp);

        this.txt = new TextPanel(ctx, defaultColour, false);
        this.add(this.txt);
    }

    animate() {
        if (!this.comp.isWorking()) {
            return;
        }

        // Scaling is relative to parent display.
        let parent = this.game.displays;
        if (parent.hudIsOn) {
            let list = this.ship.getAheadList();

            this.txt.empty();

            if ((undefined != list) && (list.length != 0)) {
                let item = list[0].getItem();
                if (item instanceof Rock) {
                    let compos = item.getComposition().composition;
                    for (let i = 0; i < compos.length; i++) {
                        let compo = compos[i];
                        this.txt.addLn(compo.type.getSymbol() + " " + compo.percentage + "%");
                    }
                }
            } 

            for (let panel of this.subPanels) {
                panel.animate();
            }
        }
    }

    resize(width, height, x, y) {
        super.resize(width, height, x, y)

        for (let panel of this.subPanels) {
            panel.resize(this.width, this.sz * 2, this.right + this.lineWidth, this.top);
            panel.setMaxTxtSz(this.txtSz/2);  // Because we don't know it at construct time.
        }
    }
}

export default MiningHudDisplay;