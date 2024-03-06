// Menuing system
//
// ToDo ... A bit of a 'hack' at present. If you think you can improve this feel free to do so ... but please update/test existing menus.

// Sits on top of the emulated terminal.

import * as THREE from 'three';
import Terminal from './terminal.js';
import helpMenu from './Menus/helpMenu.js';
import topMenu from './Menus/topMenu.js';
import {gameMenu} from './Menus/gameMenu.js'
import {GameIternalsMenu} from './Menus/gameMenu.js'
import maintenanceMenu from './Menus/maintenanceMenu.js';
import ComponentSetMenu from './Menus/componentSetMenu.js';
import Universe from '../universe.js';

class MenuSystem {
    // Menus as 'pig' XML. 
    //
    // Either define here or import from other files.
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

    display;

    menuStack = new Array();

    // Cursor and line count start from '1'. '0' means there are no selectable lines (or rows) yet ... don't display a cursor.
    targetCursor;           // Target position of cursor in parent menu
    maxYCursor = 0;

    parser;

    constructor(display) {
        this.display = display;

        this.parser = new DOMParser();
        this.pushMenu(topMenu);
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
        this.targetCursor = new THREE.Vector2(1, 1);
        this.maxYCursor = 0;
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
        if (keyboard.getClearState("X") || keyboard.getClearState("x")) {
            if (this.targetCursor.y < this.maxYCursor) {
                this.targetCursor.y++;
            }
        }

        if (keyboard.getClearState("S") || keyboard.getClearState("s")) {
            if (this.targetCursor.y > 1) {
                this.targetCursor.y--;
            }
        }

        if (keyboard.getClearState("<") || keyboard.getClearState(",")) {
            if (this.targetCursor.x > 1) {
                this.targetCursor.x--;
            }
        }

        if (keyboard.getClearState(">") || keyboard.getClearState(".")) {
            this.targetCursor.x++;
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
        // this.dumpXmlDoc(doc)

        // Cursor to first field
        let cursor = new THREE.Vector2(0, 1);

        this.printChild(doc.children[0], keyboard, cursor, false, false);

        // Add default 'back' and 'exit' selection.
        if (this.menuStack.length > 1) {
            cursor.x = 1;
            if (this.targetCursor.y == cursor.y) {
                this.targetCursor.x = 1;
            }
            let selected = this.targetCursor.equals(cursor);
            this.display.terminal.println("\tBack", selected);
            if (selected && this.isClicked(keyboard)) {
                this.popMenu();
                return;
            }
            cursor.y++;
        }

        cursor.x = 1;
        if (this.targetCursor.y == cursor.y) {
            this.targetCursor.x = 1;
        }
        let selected = this.targetCursor.equals(cursor);
        this.display.terminal.println("\tExit", selected);
        if (selected && this.isClicked(keyboard)) {
            this.display.game.togglePaused();
            return;
        }

        this.maxYCursor = cursor.y;
    }

    // Do the specifics for each child element type.
    // Returns number of selectable items within child.
    // ToDo. Really should be driven of a table mappinng tag to 'features'.
    printChild(child, keyboard, cursor, highlight, centered) {

        // Handle attributes
        if (child.attributes != undefined) {
            for (let j = 0; j < child.attributes.length; j++) {
                let attrib = child.attributes[j];
                if (attrib.specified) {
                    if (attrib.name === "HIGHLIGHT") {
                        highlight = true;
                    }

                    if (attrib.name === "ALIGN") {
                        if (attrib.value == "CENTER") {
                            centered = true;
                        }
                    }
                }
            }
        }

        // Is this element selectable?
        let selectable = false;
        switch (child.nodeName) {
            // Selectable items on line.
            case "input":
            case "INPUT":
            case "a":
            case "A":
                selectable = true;
                break;

            default:
                break
        }

        let selectableCount = 0;
        if (selectable) {
            cursor.x++;
            selectableCount++;
        }

        // Are we the element at target cursor?
        let clicked = false;
        if (selectable && this.targetCursor.equals(cursor)) {
            highlight = !highlight;
            if (this.isClicked(keyboard)) {
                clicked = true;
            }
        }

        // console.log(child.tagName + " " + this.boundedCursor.x + " " + + this.boundedCursor.y + " " + cursor.x + " " + cursor.y + " " + clicked + " " + highlight)

        // Print/activate child.
        switch (child.nodeName) {
            case "script":
            case "SCRIPT":
                // Invoke script and print output output
                let scriptName = child.attributes.src;
                let params = child.attributes.params;

                let op = "";
                if (undefined == params) {
                    op = eval(scriptName.nodeValue).printMenu();
                } else {
                    // ToDo : Handle variable numbers of arguments.
                    op = eval(scriptName.nodeValue).printMenu(eval(params.nodeValue));
                }

                let childDoc = this.parser.parseFromString(op, "text/xml");
                this.printChild(childDoc, keyboard, cursor, false, false);

                break;

            case "a":
            case "A":
                if (clicked) {
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
                        if (undefined == MenuSystem[linkName]) {
                            // Get imported
                            // They say eval is evil. But I can't find a better way.
                            this.pushMenu(eval(linkName));
                        } else {
                            // Gen local.
                            this.pushMenu(MenuSystem[linkName]);
                        }
                    }
                }
                break;

            case "#text":
                this.display.terminal.print(child.textContent, highlight, centered);
                break;

            default:
                break;
        }

        selectableCount += this.printChildren(child, keyboard, cursor, highlight, centered);

        // In some cases print a line feed.
        let lfReqd = false;
        switch (child.nodeName) {
            case "li":
            case "LI":
            case "tr":
            case "TR":
            case "p":
            case "P":
                lfReqd = true;
                break;

            default:
                break
        }

        if (lfReqd) {
            // If this is the current line limit X cursor to available item count.
            if (this.targetCursor.y == cursor.y) {
                if (selectableCount > 0) {
                    if (this.targetCursor.x > selectableCount) {
                        this.targetCursor.x = selectableCount;
                    }
                }
            }
        }

        if (lfReqd) {
            // Move display down
            this.display.terminal.print("\n", false, false);

            // If there was anything selectable also move cursor down.
            if (0 < selectableCount) {
                cursor.y++;
                cursor.x = 0;
            }

        }

        return (selectableCount);
    }

    // Print the child element
    printChildren(parent, keyboard, cursor, highlight, centered) {
        let selectableCount = 0;
        for(let child of parent.childNodes) {
            selectableCount += this.printChild(child, keyboard, cursor, highlight, centered);
        }
        return (selectableCount);
    }

    // ToDo : Remove.
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