// Component purchase menu.
import MenuTable from './menuTable.js';
import BugError from '../../Game/bugError.js';
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

        let setIndex = 0;
        for (let set of sets) {
            if (set.size > 0) {
                doc += "<P>" + set.plural + "</P>";

                let tab = new MenuTable();

                let printHeads = true;
                let compIndex = 0;
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

                    if (comp.isAvailableInSystem(game.universe.system)) {
                        let vals = new Array();
                        vals.push(comp.getName());
                        vals.push("<button type=\"button\" onclick=\"CompPurchaseMenu.onDetailsClick(this, " + setIndex + ", " + compIndex + ")\">Show</button>");
                        if (set != sets.hullSet) {
                            vals.push("<button type=\"button\" onclick=\"CompPurchaseMenu.onBuyClick(this, " + setIndex + ", " + compIndex + ")\">" + comp.getValueInSystem(game.universe.system) + "</button>");
                            vals.push("<button type=\"button\" onclick=\"CompPurchaseMenu.onMountClick(this, " + setIndex + ", " + compIndex + ")\">" + comp.getValueInSystem(game.universe.system) + "</button>");
                        } else {
                            vals.push("<button type=\"button\" onclick=\"CompPurchaseMenu.onUpgradeClick(this," + setIndex + ", " + compIndex + " )\">" + comp.getUpgradeCost(this.getShip()) + "</button>");
                        }
                        tab.addRow(vals);
                    }
                    compIndex++;
                }
                doc += tab.toString();
                doc += "<BR />";
            }
            setIndex++;
        }

        doc += "</P>"

        return (doc);

    }

    static onDetailsClick(menuSystem, setIndex, compIndex) {
        let game = menuSystem.getGame();
        let comp = CompPurchaseMenu.getCompForIndex(game, setIndex, compIndex);
        menuSystem.pushScript(ComponentDetailsMenu, comp);
    }

    static onBuyClick(menuSystem, setIndex, compIndex) {
        let game = menuSystem.getGame();
        let comp = CompPurchaseMenu.getCompForIndex(game, setIndex, compIndex);
        let ship = game.getShip();

        comp.buy(ship);
    }

    static onMountClick(menuSystem, setIndex, compIndex) {
        let game = menuSystem.getGame();
        let comp = CompPurchaseMenu.getCompForIndex(game, setIndex, compIndex);
        let ship = game.getShip();

        comp.mount(ship, true);
    }

    static onUpgradeClick(menuSystem, setIndex, compIndex) {
        let game = menuSystem.getGame();
        let comp = CompPurchaseMenu.getCompForIndex(game, setIndex, compIndex);
        let ship = game.getShip();

        comp.upgrade(ship);
    }

    static getCompForIndex(game, setIndex, compIndex) {
        let set = game.componentsList.get(setIndex);
        let comp = set.get(compIndex);
        return(comp);
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