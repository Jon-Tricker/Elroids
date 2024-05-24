// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.
import MenuTable from './menuTable.js';

let repairMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Ship Repair Menu</P>\
<P></P>\
<script src=\"RepairMenu\" params=\"this.display.game.ship\"></script>\
</BODY>"

class RepairMenu {

    static printMenu(ship) {
        let sets = ship.compSets;
        let doc = "";

        doc += "<P>"

        if (null == ship.dockedWith) {
            doc += "<P HIGHLIGHT=\"true\">Not docked:</P>";
            doc += "<UL>";
            doc += "<LI>\tCosts doubled.</LI>";
            doc += "<LI>\tCannot repair above 50%.</LI>";
            doc += "</UL>";
            doc += "<P></P>";
        }

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
                row.push(RepairMenu.getButtonText(set, 10));
                row.push(RepairMenu.getButtonText(set, 100));

                tab.addRow(row);
            }
        }
                
        doc += tab.toString();

        doc += "</P>"

        return (doc);
    }

    static getButtonText(set, percent) {
        let cost = set.getRepairCost(percent)

        if(0 == cost) {
            return("<button type=\"button\" onclick=\"RepairMenu.onRepairClick(this.display.game.ship, cursor, 0)\">N/A</button>");
        } else {
            return("<button type=\"button\" onclick=\"RepairMenu.onRepairClick(this.display.game.ship, cursor, " + percent +")\">" + cost + "</button>");
        }
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

export {repairMenu, RepairMenu};