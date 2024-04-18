// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

let gameMenu = "\
<BODY>\
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Game control Menu</P>\
    <script src=\"GameInternalsMenu\" params=\"this.display.game\"></script>\
    <P></P>\
</BODY>"


class GameInternalsMenu {

    static printMenu(game) {
        let doc = "";

        doc += "<P>";

        doc += "<P>Rocks: count=" + game.rockCount + ", Max count=" + game.maxRockCount + "(ish)</P>";
        doc += "<P>Saucers: Mother count=" + game.motherSaucerCount + ", Count=" + game.saucerCount + ", Max count=" + game.maxSaucerCount + "</P>";

        doc += "<P>Show missiles on radar <button type=\"button\" onclick=\"GameInternalsMenu.click(this.display)\">" + game.displays.radar.showMissiles + "</button></P>";

        doc += "</P>";

        return (doc);

    }

    static click(display) {
        display.radar.showMissiles = !display.radar.showMissiles;
    }
}

export {gameMenu, GameInternalsMenu}