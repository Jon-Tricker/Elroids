// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

import GameError from '../../GameErrors/gameError.js';

let gameMenu = "\
<BODY>\
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Game control Menu</P>\
    <BR />\
    <script src=\"GameInternalsMenu\" game=\"this.getGame()\"></script>\
    <BR />\
</BODY>"


class GameInternalsMenu {

    static printMenu(game) {
        let doc = "";

        doc += "<P>";
        doc += "<BR />"

        doc += "<P>Rocks: count=" + game.getSystem().rockCount + ", Max count=" + game.getSystem().maxRockCount + "(ish)</P>";
        doc += "<P>Saucers: Mother count=" + game.universe.system.motherSaucerCount + ", Count=" + game.getSystem().saucerCount + ", Max count=" + game.maxSaucerCount + "</P>";

        doc += "<BR />";
        doc += "<P>Game:</P>";
        doc += "<P>\t<button type=\"button\" onclick=\"GameInternalsMenu.saveClick(this.display.game)\">Save</button> "
        doc += "<button type=\"button\" onclick=\"GameInternalsMenu.loadClick(this.display.game)\">Load</button></P>"
        doc += "<P>Partially implemtented. Ship internals/cargo not yet saved!</P>";
        doc += "<BR />";
        

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

    static saveClick(game) {
        game.save();
    }

    static loadClick(game) {
        game.load();
    }
}

export {gameMenu, GameInternalsMenu}