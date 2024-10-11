// Component purchase menu.
import MenuTable from './menuTable.js';
import BugError from '../../GameErrors/bugError.js';
import { ComponentsMenu } from './componentsMenu.js';

let compPurchaseMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Components Purchase Menu</P>\
<script src=\"CompPurchaseMenu\" game=\"this.getGame()\"></script>\
</BODY>"

class CompPurchaseMenu {

    static printMenu(game) {
        let sets = game.componentsList;
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
                            heads.push("Buy(Cr)");
                            heads.push("Mount(Cr)");
                        } else {
                            heads.push("Upgrade(Cr)");
                        }

                        tab.addHeadings(heads);
                        printHeads = false;
                    }

                    if (comp.getTechLevel() <= game.universe.system.getTechLevel()) {
                        let vals = new Array();
                        vals.push(comp.getName());
                        vals.push("<button type=\"button\" onclick=\"CompPurchaseMenu.onDetailsClick(this, cursor)\">Show</button>");
                        if (set != sets.hullSet) {
                            vals.push("<button type=\"button\" onclick=\"CompPurchaseMenu.onBuyClick(this, cursor)\">" + comp.getCurrentValue(game.universe.system) + "</button>");
                            vals.push("<button type=\"button\" onclick=\"CompPurchaseMenu.onMountClick(this, cursor)\">" + comp.getCurrentValue(game.universe.system) + "</button>");
                        } else {
                            vals.push("<button type=\"button\" onclick=\"CompPurchaseMenu.onUpgradeClick(this, cursor)\">" + comp.getUpgradeCost(this.getShip()) + "</button>");
                        }
                        tab.addRow(vals);
                    }
                }
                doc += tab.toString();
                doc += "<BR />";
            }
        }


        doc += "</P>"

        return (doc);

    }

    static onDetailsClick(menuSystem, cursor) {
        let game = menuSystem.getGame();
        let comp = CompPurchaseMenu.getCompForCursor(game, cursor);

        ComponentsMenu.displayDetails(menuSystem, comp);
    }

    static onBuyClick(menuSystem, cursor) {
        let game = menuSystem.getGame();
        let comp = CompPurchaseMenu.getCompForCursor(game, cursor);
        let ship = game.getShip();

        comp.buy(ship);
    }

    static onMountClick(menuSystem, cursor) {
        let game = menuSystem.getGame();
        let comp = CompPurchaseMenu.getCompForCursor(game, cursor);
        let ship = game.getShip();

        comp.mount(ship, true);
    }

    static onUpgradeClick(menuSystem, cursor) {
        let game = menuSystem.getGame();
        let comp = CompPurchaseMenu.getCompForCursor(game, cursor);
        let ship = game.getShip();

        comp.upgrade(ship);
    }

    static getCompForCursor(game, cursor) {
        let compNumber = 0;
        for (let set of game.componentsList) {
            for (let comp of set) {
                if (comp.getTechLevel() <= game.universe.system.getTechLevel()) {
                    if (compNumber == cursor.y) {
                        return (comp);
                    } else {
                        compNumber++;
                    }
                }
            }
        }
        throw (new BugError("No component at cursor."));
    }
}

// A menu with arguments
class ComponentDetailsMenu {

    static printMenu(comp) {
        let doc = "";

        doc += "<BODY>"
        doc += "<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Component Details Menu</P>"

        doc += "<BR />";

        let tab = new MenuTable();

        let heads = comp.getHeadings();
        tab.addHeadings(heads);

        let vals = comp.getValues();
        tab.addRow(vals);

        doc += tab.toString();

        doc += "<BR />";

        // If it's a hull show slots.
        if (comp.set == comp.set.sets.hullSet) {
            tab = new MenuTable();

            heads = new Array();
            heads.push("Slots");
            for (let set of comp.set.sets) {
                heads.push(set.plural);
            }
            tab.addHeadings(heads);

            vals = new Array();
            vals.push("");
            for (let set of comp.set.sets) {
                vals.push(set.slots);
            }
            tab.addRow(vals);

            doc += tab.toString();

            doc += "<BR />";
        }

        doc += "<P>";
        doc += comp.getDescription();
        doc += "</P>";

        doc += "<BR />";

        doc += "</BODY>"

        return (doc);
    }

}

export { compPurchaseMenu, CompPurchaseMenu, ComponentDetailsMenu };