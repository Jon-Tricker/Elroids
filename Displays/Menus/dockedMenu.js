let dockedMenu = "\
<BODY>\
<BR />\
<P ALIGN=\"CENTER\">'VenusTech 100' (TM) ship control terminal.\n </P>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Ship docked</P>\
<BR />\
<P ALIGN=\"CENTER\">\t... Press 'p' to also pause/unpause.\n </P>\
<P ALIGN=\"CENTER\">\t... Select 'Undock' to undock.\n </P>\
<P ALIGN=\"CENTER\">Control with navigation controls ... <BR />\
(\"S\" - Up, \"X\" - Down, \"Z\" - Left, \"C\" - Right, <BR />\
\"&lt;\" - Scroll up, \"&gt;\" - Scroll down, \"M\" - Select).\n</P>\
"/*
\
        <P>\t<button type=\"button\" onclick=\"GameInternalsMenu.saveClick(this.display.game)\">Save</button>\
        <button type=\"button\" onclick=\"GameInternalsMenu.loadClick(this.display.game)\">Load</button></P>\
\
*/ + "\
<UL>\
    <LI><A HREF=\"helpMenu\">Menu controls help screen.</A></LI>\
    <LI><A HREF=\"cargoMenu\">Cargo bay</A></LI>\
    <LI><A HREF=\"componentsMenu\">Ship Components Menu.</A></LI>\
    <LI><A HREF=\"compPurchaseMenu\">Components Purchase Menu.</A></LI>\
    <LI><A HREF=\"goodsPurchaseMenu\">Goods Purchase Menu.</A></LI>\
    <LI><A HREF=\"starSystemsMenu\">Guide to the Galaxy.</A></LI>\
    <LI><A HREF=\"gameMenu\">Game Configuration Menu.</A></LI>\
    <LI><A HREF=\"aboutMenu\">About \"Elroids\".</A></LI>\
</UL>\
</BODY>"

export default dockedMenu;