// Star systems menu.
import MenuTable from './menuTable.js';
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
        heads.push("Can dock");
        heads.push("Hunted");
        tab.addHeadings(heads);

        let index = 0;
        for (let system of systems) {
            let vals = new Array();
            vals.push("<button type=\"button\" onclick=\"StarSystemsMenu.onDetailsClick(this, " + index + ")\">" + system.spec.name + "</button>");
            let rep = Reputation.getRepInSystem(game.player, system);
            vals.push(rep.getText());
            vals.push(rep.getCanDock());
            vals.push(rep.getAttack());
            tab.addRow(vals);
            index ++;
        }

        doc += tab.toString();

        doc += "</P>";

        return (doc);

    }

    static onDetailsClick(menuSystem, index) {
        let game = menuSystem.getGame();
        let system = game.universe.systems.get(index);

        StarSystemsMenu.displayDetails(menuSystem, system);
    }

    static displayDetails(menuSystem, system) {
        menuSystem.pushScript(StarSystemDetailsMenu, system);
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