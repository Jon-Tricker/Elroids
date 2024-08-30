// Component details menu.
import MenuTable from './menuTable.js';
import BugError from '../../GameErrors/bugError.js';

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
                            heads.push("Unmount");
                            heads.push("Sell");
                        }
                        tab.addHeadings(heads);
                        printHeads = false;
                    }

                    let vals = new Array();
                    vals.push(comp.name);
                    vals.push(comp.mass);
                    vals.push(comp.status);
                    vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onDetailsClick(this, cursor)\">Show</button>");
                    vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onEnableClick(this, cursor)\">" + ComponentsMenu.onOff(comp.displayPanel) + "</button>");
                    if (null != ship.dockedWith) {
                        if (sets.hullSet == set) {
                            vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onUnmountClick(this, cursor)\">N/A</button>");
                            vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onSellClick(this, cursor)\">N/A</button>");
                        } else {
                            vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onUnmountClick(this, cursor)\">Unmount</button>");
                            vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onSellClick(this, cursor)\">" + comp.getCurrentValue(ship.system) + "</button>");
                        }
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

    static onOff(bool) {
        if (bool) {
            return ("On");
        }
        return ("Off");
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
        this.displayDetails(menuSystem, comp);
    }

    static displayDetails(menuSystem, comp) {
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

export { componentsMenu, ComponentsMenu, ComponentDetailsMenu };