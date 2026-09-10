// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.
import Game from "../../Game/game.js";

let gameMenu = "\
<BODY>\
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Game control Menu</P>\
    <BR />\
    <script src=\"GameInternalsMenu\"></script>\
    <BR />\
</BODY>"


class GameInternalsMenu {

    static printMenu() {
        let doc = "";

        doc += "<P>";
        doc += "<BR />"

        let game = Game.getGame();

        doc += "<P>Rocks: count=" + game.getSystem().rockCount + ", Max count=" + game.getSystem().maxRockCount + "(ish)</P>";
        // doc += "<P>Saucers: Mother count=" + game.getSystem().motherSaucers.length + ", Count=" + game.getSystem().saucerCount + ", Max count=" + game.maxSaucerCount + "</P>";

        doc += "<BR />";
        doc += "<P>Game:</P>";
        doc += "<P>\t<button type=\"button\" onclick=\"GameInternalsMenu.saveClick()\">Save</button> - Downloads game state to a file in your 'download' directory.</P>"
        doc += "<BR />";
        doc += "<P>\t<button type=\"button\" onclick=\"GameInternalsMenu.loadClick()\">Load</button> - When promted upload a peviously downloaded save file.</P>"
        doc += "<BR />";
        

        doc += "<P>Show missiles on radar <button type=\"button\" onclick=\"GameInternalsMenu.missileClick(this.display)\">" + game.displays.radar.showMissiles + "</button></P>";
        doc += "<P>Play sound <button type=\"button\" onclick=\"GameInternalsMenu.soundClick()\">" + game.soundOn + "</button></P>";

        doc += "</P>";

        return (doc);

    }

    static missileClick(display) {
        display.radar.showMissiles = !display.radar.showMissiles;
    } 
    
    static soundClick() {
        let game = Game.getGame();
        game.soundOn = !game.soundOn;
    }

    static saveClick() {
        Game.getGame().save();
    }

    static loadClick() {
        Game.getGame().load();
    }
}

export {gameMenu, GameInternalsMenu}