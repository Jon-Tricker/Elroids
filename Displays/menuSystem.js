// Menuing system
//
// ToDo ... A bit of a 'hack' at present. If you think you can improve this feel free to do so ... but please update/test existing menus.

// Sits on top of the emulated terminal.

import * as THREE from 'three';
import Terminal from './terminal.js'

class MenuSystem {
    // Menus as 'pig' XML. 
    //
    // ToDo. Each of these should ba a sepatare .xml file. But that would require extra effort reading and importing them. 
    //          It seems difficult to do this in a browser independant way.

    static topMenu = " \
    <BODY> \
    <P></P> \
    <P ALIGN=\"CENTER\"> =============== EEEEEE</P> \
    <P ALIGN=\"CENTER\"> ============ E    </P> \
    <P ALIGN=\"CENTER\"> ========= EEEEEE</P> \
    <P ALIGN=\"CENTER\"> ====== E    </P> \
    <P ALIGN=\"CENTER\"> === EEEEEE</P> \
    <P></P> \
    <P ALIGN=\"CENTER\">Welcome to the 'VenusTech 100' ship control terminal.\n </P> \
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Game Paused</P> \
    <P></P> \
    <P ALIGN=\"CENTER\">\t... Press 'p' to continue.\n </P> \
    <P ALIGN=\"CENTER\">Control with navigation controls ... (\"S\" - Up, \"X\" - Down, \"M\" - Select).\n</P> \
    <UL> \
        <LI><A HREF=\"helpMenu\">\tMenu controls help screen.</A></LI> \
        <LI><A HREF=\"commerceMenu\">\tCommerce Menu (TBD).</A></LI> \
        <LI><A HREF=\"maintenanceMenu\">\tShip Maintenance/Upgrade Menu (TBD).</A></LI> \
        <LI><A HREF=\"configurationMenu\">\tGame Configuration Menu (TBD).</A></LI> \
    </UL> \
    </BODY> \
    "

    static helpMenu = " \
    <BODY> \
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Menu Controls</P> \
    <P ALIGN=\"CENTER\">\nBased on ship controls. Hopefully eventually usable without keyboard.\n</P> \
    <P>\t\"S\" - Cursor up.</P> \
    <P>\t\"X\" - Cursor down.</P> \
    <P>\t\">\" - Cursor right. (TBD)</P> \
    <P>\t\"&lt;\" - Cursor left. (TBD)</P> \
    <P>\t\"M\" - Select current cursor item.</P> \
    <UL> \
    </UL> \
    </BODY> \
    "

    static commerceMenu = " \
    <BODY> \
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Commerce Menu</P> \
    <P ALIGN=\"CENTER\">Eventually these options will only be available when docked at a station.</P> \
    <P>\n</P> \
    <P ALIGN=\"CENTER\">To be done (TBD).</P> \
    <UL> \
    </UL> \
    </BODY> \
    "

    static maintenanceMenu = " \
    <BODY> \
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Ship Maintenance Menu</P> \
    <P>\n</P> \
    <P ALIGN=\"CENTER\">To be done (TBD).</P> \
    <UL> \
    </UL> \
    </BODY> \
    "

    static configurationMenu = " \
    <BODY> \
    <P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Game Configuration Menu</P> \
    <P>\n</P> \
    <P ALIGN=\"CENTER\">To be done (TBD).</P> \
    <UL> \
    </UL> \
    </BODY> \
    "


    display;

    menuStack = new Array();
    printingMenu;

    // Cursor and line count start from '1'. '0' means there are no selectable lines (or rows) yet ... don't display a cursor.
    cursor;
    liCount;

    parser;

    constructor(display) {
        this.display = display;

        this.parser = new DOMParser();
        this.pushMenu(MenuSystem.topMenu);
    }

    pushMenu(menu) {
        this.menuStack.push(menu);
        this.resetMenu();
    }

    popMenu() {
        if (this.menuStack.length > 1) {
            this.menuStack.pop();
        }
        this.resetMenu()
    }

    resetMenu() {
        this.cursor = new THREE.Vector2(0, 0);
        this.printingMenu = false;
        this.liCount = 0;
    }

    animate(date, keyboard) {

        this.display.terminal.clearScreen();

        let doc = this.parser.parseFromString(this.menuStack[this.menuStack.length - 1], "text/xml");

        this.liCount = 0;

        this.printDoc(doc, keyboard);

        // Handle other keyboard actions.
        this.handleKeyboard(keyboard);

        // this.dumpXmlDoc(doc);
    }

    handleKeyboard(keyboard) {
        if (keyboard.getState("<") || keyboard.getState(",")) {
        }

        if (keyboard.getClearState("X") || keyboard.getClearState("x")) {
            if (this.cursor.y < (this.liCount)) {
                this.cursor.y++;
            }
        }

        if (keyboard.getClearState("S") || keyboard.getClearState("s")) {
            if (this.cursor.y > 1) {
                this.cursor.y--;
            }
        }

        if (keyboard.getClearState("<") || keyboard.getClearState(",")) {
            if (this.cursor.x > 0) {
                this.cursor.x--;
            }
        }

        if (keyboard.getClearState(">") || keyboard.getClearState(".")) {
            // Not sure what the upper limt is.
            this.cursor.x++;
        }
    }

    isClicked(keyboard) {
        let clicked = false;
        if (keyboard.getClearState("M") || keyboard.getClearState("m")) {
            clicked = true;
        }
        return (clicked);
    }

    printDoc(doc, keyboard) {
        // Todo ... HAndle hard coded actions.

        let setPrintingMenu = false;
        if (doc.tagName === "UL") {
            this.printingMenu = true;
            setPrintingMenu = true;

            // If necessary enable cursor.
            if (0 == this.cursor.y) {
                this.cursor.y++;
            }
        }

        if (doc.tagName === "LI") {
            this.liCount++;
        }

        if (0 == doc.childElementCount) {
            let selected = this.isSelected();
            if (selected && this.isClicked(keyboard)) {
                // Take child action
                this.clickChild(doc)

                // And give up ... next animation will display result of click.
                return;
            } else {
                // Display child   
                this.printChild(doc, selected);
            }
        } else {
            for (let i = 0; i < doc.childElementCount; i++) {
                let child = doc.children[i];
                // console.log("tag " + child.tagName + " lc " + this.liCount + " cur " + this.cursor.y)

                this.printDoc(child, keyboard);
            }
        }

        // If this tag got us into the meun now leave it.
        if (setPrintingMenu) {
            // Add default 'back' and 'exit' selection.
            if (this.menuStack.length > 1) {
                this.liCount++;
                this.display.terminal.println("\tBack", this.isSelected());
                if (this.isSelected() && this.isClicked(keyboard)) {
                    this.popMenu();
                    return;
                }
            }

            this.liCount++;
            this.display.terminal.println("\tExit", this.isSelected());
            if (this.isSelected() && this.isClicked(keyboard)) {
                this.display.game.togglePaused();
                return;
            }

            this.printingMenu = false;
        }
    }

    // Determines if current line selected.
    isSelected() {
        if (!this.printingMenu) {
            // Can't select outside the menu
            return (false);
        }
        return ((this.liCount > 0) && (this.liCount == this.cursor.y));
    }

    // Carry out child actions.
    clickChild(child) {
        if (child.tagName === "A") {
            let linkName = null;

            for (let i = 0; i < child.attributes.length; i++) {
                let attrib = child.attributes[i];
                if (attrib.specified) {
                    if (attrib.name === "HREF") {
                        linkName = attrib.value;
                    }
                }
            }
            if (null == linkName) {
                console.log("No HREF in link.")
            } else {
                this.pushMenu(MenuSystem[linkName]);
            }
        }
    }

    // print a simple child element.
    printChild(child, highlight) {
        // Handle attributes
        let centered = false;
        for (let j = 0; j < child.attributes.length; j++) {
            let attrib = child.attributes[j];
            if (attrib.specified) {
                if (attrib.name === "HIGHLIGHT") {
                    highlight = !highlight;
                }

                if (attrib.name === "ALIGN") {
                    if (attrib.value == "CENTER") {
                        centered = true;
                    }
                }
            }
        }

        this.display.terminal.println(child.innerHTML, highlight, centered);
    }


    dumpXmlDoc(doc) {
        for (let i = 0; i < doc.childElementCount; i++) {
            let child = doc.children[i];
            if (0 == child.childElementCount) {
                if (child.hasAttributes()) {
                    for (let j = 0; j < child.attributes.length; j++) {
                        let attrib = child.attributes[j];
                        if (attrib.specified) {
                            console.log(attrib.name + " = " + attrib.value);
                        }
                    }
                }
                console.log("tag " + child.tagName + " inner " + child.innerHTML);
            } else {
                console.log("tag " + child.tagName);
                this.dumpXmlDoc(child);
            }
        }
    }

}

export default MenuSystem;