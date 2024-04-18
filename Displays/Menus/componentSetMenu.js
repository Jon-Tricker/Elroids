import MenuTable from './menuTable.js';

class ComponentSetMenu {

    static printMenu(ship) {
        let sets = ship.compSets;
        let doc = "";

        doc += "<P>"

        doc += "<P>Total mass " + ship.mass + "t</P>";
        doc += "<P></P>";

        for (let set of sets) {
            if (set.length > 0) {
                doc += "<P>" + set.name + " (Slots = " + set.getSlots() + ")" + "</P>"

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
                doc += "<P></P>";
            }
        }

        doc += "</P>"

        return (doc);

    }
}

export default ComponentSetMenu;