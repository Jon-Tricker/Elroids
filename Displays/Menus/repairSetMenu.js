import MenuTable from './menuTable.js';

class RepairSetMenu {

    static printMenu(ship) {
        let sets = ship.compSets;
        let doc = "";

        doc += "<P>"

        let tab = new MenuTable();

        let heads = new Array();
        heads.push("Type");
        heads.push("Status (%)");
        heads.push("Repair 10% (Cr)");
        heads.push("Repair all (Cr)");

        tab.addHeadings(heads);

        for (let set of sets) {
            if (set.length > 0) {

                let status = set.getAverageStatus();

                let row = new Array();

                row.push(set.name);
                row.push(status);
                row.push("<button type=\"button\" onclick=\"RepairSetMenu.onRepairClick(this.display.game.ship, cursor, 10)\">" + set.getRepairCost(10) + "</button>");
                row.push("<button type=\"button\" onclick=\"RepairSetMenu.onRepairClick(this.display.game.ship, cursor, 100)\">" + set.getRepairCost(100) + "</button>");

                tab.addRow(row);
            }
        }
                
        doc += tab.toString();

        doc += "</P>"

        return (doc);
    }

    static onRepairClick(ship, cursor, percent) {
        let sets = ship.compSets;   
        let setNumber = 0;
        for (let set of sets) {
            if (set.length > 0) { 
                if (setNumber == cursor.y) {
                    set.repair(percent);
                    break;
                } else {
                    setNumber ++;
                }
            }
        }
    }
}

export default RepairSetMenu;