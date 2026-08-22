// Component details menu.
import MenuTable from './menuTable.js';
import BugError from '../../Game/bugError.js';
import { ComponentDetailsMenu } from './compPurchaseMenu.js';
import { ComponentAct } from '../../Ships/Components/component.js';

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

        doc += "<P>Mass Unladen " + ship.getMass() + "(t), Total " + ship.getTotalMass() + "(t)</P>";
        doc += "<BR />";

        let setIndex = 0;
        let first = true;
        for (let set of sets) {
            if (set.size > 0) {

                if (!first) {
                    doc += "<BR />";
                }
                first = false;

                doc += "<P>" + set.plural + " (Slots = " + set.getSlots() + ")" + "</P>";

                let tab = new MenuTable();

                let printHeads = true;
                let compIndex = 0;
                for (let comp of set) {
                    if (printHeads) {
                        let heads = new Array();
                        heads.push("Name");
                        heads.push("Mass(t)");
                        if (comp instanceof ComponentAct) {
                            heads.push("Active");
                        }
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
                    if (comp instanceof ComponentAct) {
                        vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onActiveClick(this, " + setIndex + ", " + compIndex + ")\">" + comp.isActive() + "</button>");
                    }
                    vals.push(comp.status);
                    vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onDetailsClick(this, " + setIndex + ", " + compIndex + ")\">Show</button>");
                    vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onEnableClick(this, " + setIndex + ", " + compIndex + ")\">" + ComponentsMenu.onOff(comp.displayPanel) + "</button>");
                    if (null != ship.dockedWith) {
                        if (!(sets.hullSet == set)) {
                            vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onUnmountClick(this, " + setIndex + ", " + compIndex + ")\">Unmount</button>");
                            vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onSellClick(this, " + setIndex + ", " + compIndex + ")\">" + comp.getValueInSystem(ship.system) + "</button>");
                        }
                        vals.push("10%=<button type=\"button\" onclick=\"ComponentsMenu.onRepairClick(this, " + setIndex + ", " + compIndex + ", 10)\">" + ComponentsMenu.getRepairButtonText(ship, comp, 10) + "</button>" +
                            " All=<button type=\"button\" onclick=\"ComponentsMenu.onRepairClick(this, " + setIndex + ", " + compIndex + ", 100)\">" + ComponentsMenu.getRepairButtonText(ship, comp, 100) + "</button>");
                    } else {
                        vals.push("10%=<button type=\"button\" onclick=\"ComponentsMenu.onRepairClick(this, " + setIndex + ", " + compIndex + ", 10)\">" + ComponentsMenu.getRepairButtonText(ship, comp, 10) + "</button>" +
                            " Max=<button type=\"button\" onclick=\"ComponentsMenu.onRepairClick(this, " + setIndex + ", " + compIndex + ", 100)\">" + ComponentsMenu.getRepairButtonText(ship, comp, 100) + "</button>");
                    }
                    tab.addRow(vals);

                    compIndex++;
                }

                doc += tab.toString();
            }
            setIndex++;
        }

        doc += "</P>"

        return (doc);

    }

    static getRepairButtonText(ship, comp, percent) {
        let cost = comp.getRepairCost(percent, ship)

        if (0 == cost) {
            return ("N/A");
        }

        return (cost);
    }

    static onOff(bool) {
        if (bool) {
            return ("On");
        }
        return ("Off");
    }

    static onRepairClick(menuSystem, setIndex, compIndex, percent) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForIndex(ship, setIndex, compIndex, false);
        comp.repair(percent, ship, false);
    }

    static onUnmountClick(menuSystem, setIndex, compIndex) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForIndex(ship, setIndex, compIndex);
        comp.unmount();
    }

    static onSellClick(menuSystem, setIndex, compIndex) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForIndex(ship, setIndex, compIndex);
        comp.sell();
    }

    static onEnableClick(menuSystem, setIndex, compIndex) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForIndex(ship, setIndex, compIndex);
        comp.displayPanel = !comp.displayPanel;

        // Re-layout displays.
        ship.getGame().displays.compDisplays.recalc(true);
    }

    static onDetailsClick(menuSystem, setIndex, compIndex) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForIndex(ship, setIndex, compIndex);
        menuSystem.pushScript(ComponentDetailsMenu, comp);
    }

    static onActiveClick(menuSystem, setIndex, compIndex) {
        let ship = menuSystem.getShip();
        let comp = ComponentsMenu.getCompForIndex(ship, setIndex, compIndex);
        comp.setActive(!comp.isActive());
    }

    static getCompForIndex(ship, setIndex, compIndex) {
        let set = ship.hull.compSets.get(setIndex);
        let comp = set.get(compIndex);
        return (comp);
    }
}


export { componentsMenu, ComponentsMenu };