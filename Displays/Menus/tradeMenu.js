// Trade price menus.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Game from '../../Game/game.js';
import MenuTable from './menuTable.js';

class SystemTradeDetailsMenu {

    static printMenu(system) {
        let doc = "<BODY>\
                <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Trade values for " + system.getName() + "</P>\
                <P>\n";

        let valTab = new MenuTable();

        let heads = new Array();
        heads.push("Type");
        heads.push("Available");
        heads.push("Legal");
        heads.push("Base\nvalue");
        heads.push("System\nvalue");

        valTab.addHeadings(heads);

        for (let goods of Game.getGame().goodsList) {
            let vals = new Array();
            let avail = goods.isAvailableInSystem(system)
            vals.push(goods.getName(true));
            vals.push(avail);
            vals.push(goods.isLegal(system));
            vals.push(goods.getCost());
            vals.push(goods.getUnitCostInSystem(system));

            valTab.addRow(vals);
        }

        doc += valTab.toString();
        doc += "</P>";
        doc += "</BODY>"

        return (doc);
    }
}

class GoodsTradeDetailsMenu {

    static printMenu(goods) {
        let doc = "<BODY>\
                <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Trade values for " + goods.getName() + "</P>\
                <P>\n";

        doc += "\nTrading values (Base = " + goods.getCost() + "(Cr)):\n\n"
        
        let valTab = new MenuTable();
        
        let heads = new Array();
        heads.push("System");
        heads.push("Legal");
        heads.push("Value\n(Cr)");
        
        valTab.addHeadings(heads);

        for (let system of Game.getGame().getUniverse().systems) {
            let vals = new Array();
            vals.push(system.spec.name);
            vals.push(goods.isLegal(system));
            vals.push(goods.getUnitCostInSystem(system));
            
            valTab.addRow(vals);
        }

        doc += valTab.toString();
        doc += "</P>";
        doc += "</BODY>"

        return (doc);
    }
}

export { SystemTradeDetailsMenu, GoodsTradeDetailsMenu };