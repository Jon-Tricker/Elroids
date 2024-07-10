// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.
import MenuTable from './menuTable.js';
import GameError from '../../GameErrors/gameError.js';

let repairMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Ship Repair Menu</P>\
<BR />\
<script src=\"RepairMenu\" ship=\"this.display.game.ship\"></script>\
</BODY>"

class RepairMenu {

    static printMenu(ship) {
        let sets = ship.hull.compSets;
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
            if (set.size > 0) {

                let status = set.getAverageStatus();

                let row = new Array();

                row.push(set.plural);
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
            return("<button type=\"button\" onclick=\"RepairMenu.onRepairClick(this.display.game.ship, cursor, null)\">N/A</button>");
        } else {
            return("<button type=\"button\" onclick=\"RepairMenu.onRepairClick(this.display.game.ship, cursor, " + percent +")\">" + cost + "</button>");
        }
    }

    static onRepairClick(ship, cursor, percent) {

        if(null == percent) {
            throw(new GameError("Repair not available."))
        }

        let sets = ship.hull.compSets;   
        let setNumber = 0;
        for (let set of sets) {
            if (set.size > 0) { 
                if (setNumber == cursor.y) {
                    if (!set.repair(percent)) {
                        throw(new GameError("Repair incomplete."))
                    }
                    break;
                } else {
                    setNumber ++;
                }
            }
        }
    }
}

export {repairMenu, RepairMenu};