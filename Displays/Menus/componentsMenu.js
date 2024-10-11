// Component details menu.
import MenuTable from './menuTable.js';
import BugError from '../../GameErrors/bugError.js';
import { ComponentDetailsMenu } from './compPurchaseMenu.js';

let componentsMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Ship Components Menu</P>\
<script src=\"ComponentsMenu\" ship=\"this.getShip()\"></script>\
</BODY>"

class ComponentsMenu {

    static printMenu(ship) {
        let sets = ship.hull.compSets;
        let doc = "";

        doc += "<P>"

        doc += "<P>Unladen mass " + ship.getMass() + "(t)</P>";
        doc += "<BR />";

        for (let set of sets) {
            if (set.size > 0) {
                doc += "<P>" + set.plural + " (Slots = " + set.getSlots() + ")" + "</P>";

                let tab = new MenuTable();

                let printHeads = true;
                for (let comp of set) {
                    if (printHeads) {
                        let heads = new Array();
                        heads.push("Name");
                        heads.push("Mass(t)");
                        heads.push("Status(%)");
                        heads.push("Details");
                        heads.push("Display");
                        if (null != ship.dockedWith) {
                            if (!(sets.hullSet == set)) {
                                heads.push("Unmount");
                                heads.push("Sell");
                            }
                        }
                        heads.push("Repair(Cr)");
                        tab.addHeadings(heads);
                        printHeads = false;
                    }

                    let vals = new Array();
                    vals.push(comp.getName());
                    vals.push(comp.getMass());
                    vals.push(comp.status);
                    vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onDetailsClick(this, cursor)\">Show</button>");
                    vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onEnableClick(this, cursor)\">" + ComponentsMenu.onOff(comp.displayPanel) + "</button>");
                    if (null != ship.dockedWith) {
                        if (!(sets.hullSet == set)) {
                            vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onUnmountClick(this, cursor)\">Unmount</button>");
                            vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onSellClick(this, cursor)\">" + comp.getCurrentValue(ship.system) + "</button>");
                        }
                        vals.push("10%=<button type=\"button\" onclick=\"ComponentsMenu.onRepairClick(this, cursor, 10)\">" + ComponentsMenu.getRepairButtonText(ship, comp, 10) + "</button>" +
                            " All=<button type=\"button\" onclick=\"ComponentsMenu.onRepairClick(this, cursor, 100)\">" + ComponentsMenu.getRepairButtonText(ship, comp, 100) + "</button>");
                    } else {
                        vals.push("10%=<button type=\"button\" onclick=\"ComponentsMenu.onRepairClick(this, cursor, 10)\">" + ComponentsMenu.getRepairButtonText(ship, comp, 10) + "</button>" +
                            " All=<button type=\"button\" onclick=\"ComponentsMenu.onRepairClick(this, cursor, 100)\">" + ComponentsMenu.getRepairButtonText(ship, comp, 100)  + "</button>");
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

    static getRepairButtonText(ship, comp, percent) {
        let cost = comp.getRepairCost(percent, ship)

        if (0 == cost) {
            return("N/A");
        }

        return(cost);
    }

    static onOff(bool) {
        if (bool) {
            return ("On");
        }
        return ("Off");
    }

    static onRepairClick(menuSystem, cursor, percent) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForCursor(ship, cursor, false);
        comp.repair(percent, ship, false);
    }

    static onUnmountClick(menuSystem, cursor) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForCursor(ship, cursor);
        comp.unmount();
    }

    static onSellClick(menuSystem, cursor) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForCursor(ship, cursor);
        comp.sell();
    }

    static onEnableClick(menuSystem, cursor) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForCursor(ship, cursor);
        comp.displayPanel = !comp.displayPanel;

        // Re-layout displays.
        ship.getGame().displays.compDisplays.recalc(true);
    }

    static onDetailsClick(menuSystem, cursor) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForCursor(ship, cursor);
        menuSystem.pushScript(ComponentDetailsMenu, comp);
    }

    static getCompForCursor(ship, cursor) {
        let compNumber = 0;
        for (let set of ship.hull.compSets) {
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


export { componentsMenu, ComponentsMenu };