// Menu with a script.
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

let maintenanceMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Ship Maintenance Menu</P>\
<script src=\"ComponentSetMenu\" params=\"this.display.game.ship\"></script>\
</BODY>"

export default maintenanceMenu;