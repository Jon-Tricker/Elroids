// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

let repairMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Ship Repair Menu</P>\
<P></P>\
<script src=\"RepairSetMenu\" params=\"this.display.game.ship\"></script>\
</BODY>"

export default repairMenu;