import GameError from '../../Game/gameError.js';
import Reputation from '../../Game/reputation.js';

let playerMenu = "\
<BODY>\
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Player Menu</P>\
    <BR />\
    <script src=\"PlayerMenu\" game=\"this.getGame()\"></script>\
    <BR />\
</BODY>"

class PlayerMenu {

    static printMenu(game) {
        let doc = "";

        doc += "<P>";
        doc += "<BR />"

        doc += "<P>Reputation=" + Number(game.getPlayer().getReputation()).toFixed(1) + "</P>";

        doc += "<P>Improve reputation (Pay fines/make 'donation') <button type=\"button\" onclick=\"PlayerMenu.incRepClick(this.display.game)\">" + Reputation.REP_INC_COST + "</button></P>";

        doc += "</P>";

        return (doc);

    }

    static incRepClick(game) {
        game.getPlayer().incReputation();
    }

}

export {playerMenu, PlayerMenu}