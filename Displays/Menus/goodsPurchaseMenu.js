// Goods purchase menu.
import MenuTable from './menuTable.js';
import BugError from '../../Game/bugError.js';
import { ComponentsMenu } from './componentsMenu.js';

let goodsPurchaseMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Goods Purchase Menu</P>\
<script src=\"GoodsPurchaseMenu\" game=\"this.getGame()\"></script>\
</BODY>"

class GoodsPurchaseMenu {

    static printMenu(game) {
        let doc = "";

        doc += "<P>"

        if (game.goodsList.size > 0) {

            let tab = new MenuTable();

            let printHeads = true;
            let index = 0;
            for (let goods of game.goodsList) {
                if (goods.isLegal(game.universe.system)) {
                    if (printHeads) {
                        let heads = new Array();
                        heads.push("Name");
                        heads.push("Details");
                        heads.push("Buy 1(Cr)");
                        heads.push("Buy 10(Cr)");

                        tab.addHeadings(heads);
                        printHeads = false;
                    }

                    if (goods.isAvailableInSystem(game.universe.system)) {
                        let vals = new Array();
                        vals.push(goods.getName(true));
                        vals.push("<button type=\"button\" onclick=\"GoodsPurchaseMenu.onDetailsClick(this, " + index + ")\">Show</button>");
                        vals.push("<button type=\"button\" onclick=\"GoodsPurchaseMenu.onBuyClick(this, " + index + ", 1)\">" + goods.getValueInSystem(game.universe.system) + "</button>");
                        vals.push("<button type=\"button\" onclick=\"GoodsPurchaseMenu.onBuyClick(this, " + index + ", 10)\">" + goods.getValueInSystem(game.universe.system) * 10 + "</button>");
                        tab.addRow(vals);
                    }
                }
                index ++;
            }
            doc += tab.toString();
            doc += "<BR />";
        }


        doc += "</P>"

        return (doc);
    }

    static onDetailsClick(menuSystem, index) {
        let game = menuSystem.getGame();
        let goods = GoodsPurchaseMenu.getGoodsForIndex(game, index);
        menuSystem.pushScript(GoodsDetailsMenu, goods);
    }

    static onBuyClick(menuSystem, index, number) {
        let game = menuSystem.getGame();
        let goods = GoodsPurchaseMenu.getGoodsForIndex(game, index);
        let ship = game.getShip();

        goods.buy(ship, number);
    }

    static getGoodsForIndex(game, index) {
        let goods = game.goodsList.get(index);
        return(goods);
    }
}

class GoodsDetailsMenu {

    static printMenu(goods) {
        let doc = "";

        doc += "<BODY>"
        doc += "<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Goods Details Menu</P>"

        doc += "<BR />";

        let tab = new MenuTable();

        let heads = goods.getHeadings();
        tab.addHeadings(heads);

        let vals = goods.getValues();
        tab.addRow(vals);

        doc += tab.toString();

        doc += "<BR />";

        doc += "<P>";
        doc += goods.getDescription();
        doc += "</P>";

        doc += "<BR />";

        doc += "</BODY>"

        return (doc);
    }
}

export { goodsPurchaseMenu, GoodsPurchaseMenu, GoodsDetailsMenu };