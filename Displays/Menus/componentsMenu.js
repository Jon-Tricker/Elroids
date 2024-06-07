// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.
import MenuTable from './menuTable.js';

let componentsMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Ship Components/Upgrades Menu</P>\
<script src=\"ComponentsMenu\" params=\"this.display.game.ship\"></script>\
</BODY>"

class ComponentsMenu {

    static printMenu(ship) {
        let sets = ship.compSets;
        let doc = "";

        doc += "<P>"

        doc += "<P>Unladen mass " + ship.mass + "(t)</P>";
        doc += "<BR />";

        for (let set of sets) {
            if (set.length > 0) {
                doc += "<P>" + set.plural + " (Slots = " + set.getSlots() + ")" + "</P>";

                let tab = new MenuTable();

                let printHeads = true;
                for (let comp of set) {
                    if (printHeads) {
                        let heads = (comp.getHeadings());
                        heads.push("Display");
                        tab.addHeadings(heads);
                        printHeads = false;
                    }

                    let vals = comp.getValues();
                    vals.push("<button type=\"button\" onclick=\"ComponentsMenu.onEnableClick(this.display.game.ship, cursor)\">" + ComponentsMenu.onOff(comp.displayPanel) + "</button>");
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
        if(bool) {
            return("On");
        }
        return("Off");
    }

    static onEnableClick(ship, cursor) {
        let compNumber = 0;
        for (let set of ship.compSets) {
            for (let comp of set) {
                if (compNumber == cursor.y) {
                    comp.displayPanel = !comp.displayPanel;

                    // Re-layout displays.
                    ship.game.displays.compDisplays.recalc(true);

                    // All done
                    return;
                } else {
                    compNumber++;
                }
            }
        }
    }
}

export { componentsMenu, ComponentsMenu };