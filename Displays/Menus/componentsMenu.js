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
                doc += "<P>" + set.plural + " (Slots = " + set.getSlots() + ")" + "</P>"

                let tab = new MenuTable();

                let printHeads = true;
                for (let comp of set) {
                    if (printHeads) {
                        tab.addHeadings(comp.getHeadings());
                        printHeads = false;
                    }

                    tab.addRow(comp.getValues());
                }
                doc += tab.toString();
                doc += "<BR />";
            }
        }

        doc += "</P>"

        return (doc);

    }
}

export { componentsMenu, ComponentsMenu};