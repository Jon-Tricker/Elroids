// Goods purchase menu.
import MenuTable from './menuTable.js';
import BugError from '../../GameErrors/bugError.js';
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
            for (let goods of game.goodsList) {
                if (printHeads) {
                    let heads = new Array();
                    heads.push("Name");
                    heads.push("Details");
                    heads.push("Buy 1(Cr)");
                    heads.push("Buy 10(Cr)");

                    tab.addHeadings(heads);
                    printHeads = false;
                }

                if (goods.getTechLevel() <= game.universe.system.getTechLevel()) {
                    let vals = new Array();
                    vals.push(goods.getName());
                    vals.push("<button type=\"button\" onclick=\"GoodsPurchaseMenu.onDetailsClick(this, cursor)\">Show</button>");
                    vals.push("<button type=\"button\" onclick=\"GoodsPurchaseMenu.onBuyClick(this, cursor, 1)\">" + goods.getCurrentValue(game.universe.system) + "</button>");
                    vals.push("<button type=\"button\" onclick=\"GoodsPurchaseMenu.onBuyClick(this, cursor, 10)\">" + goods.getCurrentValue(game.universe.system) * 10 + "</button>");
                    tab.addRow(vals);
                }
            }
            doc += tab.toString();
            doc += "<BR />";
        }


        doc += "</P>"

        return (doc);
    }

    static onDetailsClick(menuSystem, cursor) {
        let game = menuSystem.getGame();
        let goods = GoodsPurchaseMenu.getGoodsForCursor(game, cursor);
        menuSystem.pushScript(GoodsDetailsMenu, goods);
    }

    static onBuyClick(menuSystem, cursor, number) {
        let game = menuSystem.getGame();
        let goods = GoodsPurchaseMenu.getGoodsForCursor(game, cursor);
        let ship = game.getShip();

        goods.buy(ship, number);
    }

    static getGoodsForCursor(game, cursor) {
        let goodsNumber = 0;
        for (let goods of game.goodsList) {
            if (goods.getTechLevel() <= game.universe.system.getTechLevel()) {
                if (goodsNumber == cursor.y) {
                    return (goods);
                } else {
                    goodsNumber++;
                }
            }
        }
        throw (new BugError("No goods at cursor."));
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