// ToDo : Not currently used.
//
// Menu to dynamically switch safe mode.
import Game from "../../Game/game.js";

let modesMenu = "\
<BODY>\
<script src=\"ModesMenu\" game=\"Game.getGame()\"></script>\
</BODY>"

class ModesMenu {

    static printMenu(game) {
        let doc = "";
        doc += "<P>"

        doc += "<P ALIGN=\"CENTER\"> =============== EEEEEE</P>";
        doc += "<P ALIGN=\"CENTER\"> ============ E    </P>";
        doc += "<P ALIGN=\"CENTER\"> ========= EEEEEE</P>";
        doc += "<P ALIGN=\"CENTER\"> ====== E    </P>";
        doc += "<P ALIGN=\"CENTER\"> === EEEEEE\n</P>";
        doc += "<P ALIGN=\"CENTER\">Select starting modes?\n </P>";

        doc += "<P ALIGN=\"CENTER\">Toggle below than select 'Exit'?\n </P>";
    
        doc += "<UL>";
        doc += "<LI>Safe mode <button type=\"button\" onclick=\"ModesMenu.toggleSafe()\">" + Game.getGame().safe + "</button></LI>";
        doc += "</UL>";

        doc += "<P ALIGN=\"CENTER\">Control with navigation controls ... <BR />";
        doc += "(\"S\" - Up, \"X\" - Down, \"M\" - Toggle).\n</P>"

        doc += "</P>"

        return (doc);

    }
    static toggleSafe() {
        Game.getGame().safe = !Game.getGame().safe;
    }
}

export { modesMenu, ModesMenu };