// Component purchase menu.
import MenuTable from './menuTable.js';
import BugError from '../../GameErrors/bugError.js';
import { ComponentsMenu } from './componentsMenu.js';

let purchaseMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Components Purchase Menu</P>\
<script src=\"PurchaseMenu\" game=\"this.display.game\"></script>\
</BODY>"

class PurchaseMenu {

    static printMenu(game) {
        let sets = game.purchaseList;
        let doc = "";

        doc += "<P>"

        for (let set of sets) {
            if (set.size > 0) {
                doc += "<P>" + set.plural + "</P>";

                let tab = new MenuTable();

                let printHeads = true;
                for (let comp of set) {
                    if (printHeads) {
                        let heads = new Array();
                        heads.push("Name");
                        heads.push("Details");
                        if (set != sets.hullSet) {
                            heads.push("Buy (Cr)");
                            heads.push("Mount (Cr)");
                        } else {
                            heads.push("Upgrade (Cr)");
                        }

                        tab.addHeadings(heads);
                        printHeads = false;
                    }

                    let vals = new Array();
                    vals.push(comp.name);
                    vals.push("<button type=\"button\" onclick=\"PurchaseMenu.onDetailsClick(this, cursor)\">Show</button>");
                    if (set != sets.hullSet) {
                        vals.push("<button type=\"button\" onclick=\"PurchaseMenu.onBuyClick(this, cursor)\">" + comp.getCurrentValue() + "</button>");
                        vals.push("<button type=\"button\" onclick=\"PurchaseMenu.onMountClick(this, cursor)\">" + comp.getCurrentValue() + "</button>");
                    } else {
                        vals.push("<button type=\"button\" onclick=\"PurchaseMenu.onUpgradeClick(this, cursor)\">" + comp.getUpgradeCost(game.ship) + "</button>");
                    }
                    tab.addRow(vals);
                }
                doc += tab.toString();
                doc += "<BR />";
            }
        }


        doc += "</P>"

        return (doc);

    }

    static onDetailsClick(menuSystem, cursor) {
        let game = menuSystem.display.game;
        let comp = PurchaseMenu.getCompForCursor(game, cursor);

        ComponentsMenu.displayDetails(menuSystem, comp);
    }

    static onBuyClick(menuSystem, cursor) {
        let game = menuSystem.display.game;
        let comp = PurchaseMenu.getCompForCursor(game, cursor);
        let ship = game.ship;

        comp.buy(ship);
    }

    static onMountClick(menuSystem, cursor) {
        let game = menuSystem.display.game;
        let comp = PurchaseMenu.getCompForCursor(game, cursor);
        let ship = game.ship;

        comp.mount(ship, true);
    }
    
    static onUpgradeClick(menuSystem, cursor) {
        let game = menuSystem.display.game;
        let comp = PurchaseMenu.getCompForCursor(game, cursor);
        let ship = game.ship;

        comp.upgrade(ship);
    }

    static getCompForCursor(game, cursor) {
        let compNumber = 0;
        for (let set of game.purchaseList) {
            for (let comp of set) {
                if (compNumber == cursor.y) {
                    return (comp);
                } else {
                    compNumber++;
                }
            }
        }
        throw (new BugError("No component at cursor."));
    }
}

export { purchaseMenu, PurchaseMenu };