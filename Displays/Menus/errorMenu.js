// 'Pop up' menu dispolaying thrown errors.

let errorMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Error!</P>\
<BR />\
<script src=\"ErrorMenu\" error=\"this.lastError\"></script>\
</BODY>"

class ErrorMenu {

    static printMenu(error) {
        let doc = "";
        doc += "<P>"

        doc += "<P>" + error.message + "</P>";
        
        doc += "</P>"
        return(doc);
    }
}

export { errorMenu, ErrorMenu };