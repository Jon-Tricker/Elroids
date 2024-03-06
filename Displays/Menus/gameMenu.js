// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

let gameMenu = "\
<BODY>\
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Game control Menu</P>\
    <script src=\"GameIternalsMenu\" params=\"this.display.game\"></script>\
    <P></P>\
</BODY>"


class GameIternalsMenu {

    static printMenu(game) {
        let doc = "";

        doc += "<BODY>"

        doc += "<P>Rock count " + game.rockCount + " Max rock count " + game.maxRockCount + "(ish)</P>";
        doc += "</BODY>"

        return (doc);

    }
}

export {gameMenu, GameIternalsMenu}