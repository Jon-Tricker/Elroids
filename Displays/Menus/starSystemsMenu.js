// Star systems menu.
import MenuTable from './menuTable.js';
import BugError from '../../Game/bugError.js';
import { MineralType, MineralTypes } from "../../GameItems/minerals.js";
import Reputation from '../../Game/reputation.js';

let starSystemsMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Guide to the Galaxy</P>\
<P>Select system to show details:</P>\
<script src=\"StarSystemsMenu\" game=\"this.getGame()\"></script>\
</BODY>"

class StarSystemsMenu {

    static printMenu(game) {
        let systems = game.universe.systems;
        let doc = "";


        doc += "<P>";
        doc += "<BR />";

        let tab = new MenuTable();

        let heads = new Array();
        heads.push("System");
        heads.push("Reputation");
        heads.push("Can dock")
        tab.addHeadings(heads);

        for (let system of systems) {
            let vals = new Array();
            vals.push("<button type=\"button\" onclick=\"StarSystemsMenu.onDetailsClick(this, cursor)\">" + system.spec.name + "</button>");
            let rep = Reputation.getRepInSystem(game.player, system);
            vals.push(rep.getText());
            vals.push(rep.getCanDock());
            tab.addRow(vals);
        }

        doc += tab.toString();

        doc += "</P>";

        return (doc);

    }

    static onDetailsClick(menuSystem, cursor) {
        let game = menuSystem.getGame();
        let system = StarSystemsMenu.getCompForCursor(game, cursor);

        StarSystemsMenu.displayDetails(menuSystem, system);
    }

    static displayDetails(menuSystem, system) {
        menuSystem.pushScript(StarSystemDetailsMenu, system);
    }

    static getCompForCursor(game, cursor) {
        let systemNumber = 0;
        let systems = game.universe.systems;

        for (let system of systems) {
            if (systemNumber == cursor.y) {
                return (system);
            } else {
                systemNumber++;
            }
        }
        throw (new BugError("No system at cursor."));
    }
}

class StarSystemDetailsMenu {

    static printMenu(system) {
        let doc = "";

        doc += "<BODY>"
        doc += "<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Details for " + system.spec.name + " system</P>"
        doc += "<P><BR />";
        doc += "Tech level: " + system.getTechLevel();
        doc += "<BR />";
        doc += "Magic level: " + system.getMagicLevel();
        doc += "<BR />";
        doc += "Law level: " + system.getLawLevel();
        doc += "<BR />";
        doc += "<BR />";

        doc += "Mineral abundance(%):"
        doc += "<BR />";
        let tab = new MenuTable;
        let heads = new Array();
        let vals = new Array();
        for (let type = 0; type < MineralTypes.length; type++) {
            let mineral = MineralTypes[type];
            heads.push(mineral.name);
            vals.push(Math.floor(system.spec.getMineralAbundance(mineral) * 100));
        }
        tab.addHeadings(heads);
        tab.addRow(vals);
        doc += tab.toString();

        doc += "<BR />";
        doc += "Description: " + system.getDescription();
        doc += "<BR /></P>";
        doc += "</BODY>"

        return (doc);
    }
}

export { starSystemsMenu, StarSystemsMenu };