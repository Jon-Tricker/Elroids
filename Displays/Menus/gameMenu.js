// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

import GameError from '../../GameErrors/gameError.js';

let gameMenu = "\
<BODY>\
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Game control Menu</P>\
    <BR />\
    <script src=\"GameInternalsMenu\" params=\"this.display.game\"></script>\
    <BR />\
</BODY>"


class GameInternalsMenu {

    static printMenu(game) {
        let doc = "";

        doc += "<P>";
        doc += "<BR />"

        doc += "<P>Rocks: count=" + game.rockCount + ", Max count=" + game.maxRockCount + "(ish)</P>";
        doc += "<P>Saucers: Mother count=" + game.motherSaucerCount + ", Count=" + game.saucerCount + ", Max count=" + game.maxSaucerCount + "</P>";

        doc += "<P>Show missiles on radar <button type=\"button\" onclick=\"GameInternalsMenu.missileClick(this.display)\">" + game.displays.radar.showMissiles + "</button></P>";
        doc += "<P>Play sound <button type=\"button\" onclick=\"GameInternalsMenu.soundClick(this.display.game)\">" + game.soundOn + "</button></P>";

        doc += "</P>";

        return (doc);

    }

    static missileClick(display) {
        display.radar.showMissiles = !display.radar.showMissiles;
    } 
    
    static soundClick(game) {
        game.soundOn = !game.soundOn;
    }
}

export {gameMenu, GameInternalsMenu}