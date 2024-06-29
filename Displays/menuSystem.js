// Menuing system
//
// ToDo ... A bit of a 'hack' at present. If you think you can improve this feel free to do so ... but please update/test existing menus.

// Sits on top of the emulated terminal.

// Since they are dynamically loaded most of the imports, below, are needed (even though greyed out).
import * as THREE from 'three';
import Terminal from './terminal.js';
import helpMenu from './Menus/helpMenu.js';
import topMenu from './Menus/topMenu.js';
import aboutMenu from './Menus/aboutMenu.js';
import dockedMenu from './Menus/dockedMenu.js';
import { errorMenu } from './Menus/errorMenu.js';
import { ErrorMenu } from './Menus/errorMenu.js';
import { gameMenu } from './Menus/gameMenu.js'
import { GameInternalsMenu } from './Menus/gameMenu.js'
import { repairMenu } from './Menus/repairMenu.js';
import { componentsMenu } from './Menus/componentsMenu.js';
import { ComponentsMenu } from './Menus/componentsMenu.js';
import { ComponentDetailsMenu } from './Menus/componentsMenu.js';
import { RepairMenu } from './Menus/repairMenu.js';
import { cargoMenu } from './Menus/cargoMenu.js';
import { CargoMenu } from './Menus/cargoMenu.js';
import Universe from '../universe.js';
import GameError from '../GameErrors/gameError.js';
import BugError from '../GameErrors/bugError.js';

// Result of printing a child element.
class ElementResult {
    selectableCount = 0;
    width = 0;
}

// Data related to table management
class TableData {
    colWidths = new Array;
    currentCol = 0;
}

class PushedMenu {
    menu;
    cursor;

    // Optional arguments if this is a script.
    args;

    constructor(menu, cursor, args) {
        this.menu = menu;
        this.cursor = cursor;
        this.args = args;
    }
}

class MenuSystem {

    display;

    menuStack = new Array();

    // Cursor and line count start from '1'. '0' means there are no selectable lines (or rows) yet ... don't display a cursor.
    targetCursor = new THREE.Vector2(0, 0);           // Target position of cursor in parent menu
    maxYCursor = 0;

    // Ugly variable used for passing 'last error' argument.
    lastError = null;

    static parser = new DOMParser();

    constructor(display) {
        this.display = display;
        if (null != display.game.ship.dockedTo()) {
            this.pushMenu(dockedMenu);
        } else {
            this.pushMenu(topMenu);
        }
    }

    pushMenu(menu) {
        this.targetCursor = new THREE.Vector2(0, 0);
        this.menuStack.push(new PushedMenu(menu, this.targetCursor));
        this.resetMenu();
    }

    popMenu() {
        if (this.menuStack.length > 1) {
            this.menuStack.pop();
        }
        this.resetMenu()
    }

    // Push a script (dynamically generated with an argument list menu), as if it was a static menu.
    // Variable length argument list read from this functions 'arguments' variable.
    pushScript() {

        if (0 == arguments.length) {
            throw (new BugError("No script name given."));
        }

        // Remove script name from arguments.
        let script = arguments[0];
        let args = new Array();
        for (var i = 1; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        this.targetCursor = new THREE.Vector2(0, 0);
        this.menuStack.push(new PushedMenu(script, this.targetCursor, args));
        this.resetMenu();
    }

    resetMenu() {
        this.targetCursor = this.menuStack[this.menuStack.length - 1].cursor;
        this.maxYCursor = 0;

        this.display.terminal.resetScreen();
    }

    animate(date, keyboard) {

        this.display.terminal.clearScreen();

        // Get current menu.
        let menu = this.menuStack[this.menuStack.length - 1];
        let text;
        if (undefined == menu.args) {
            // Static menu.
            text = menu.menu;
        } else {
            // Dynamically created menu (with 0 or more arguments).
            text = menu.menu.printMenu.apply(this, menu.args);
        }

        let doc = MenuSystem.parser.parseFromString(text, "text/xml");

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
            if (this.targetCursor.y > 0) {
                this.targetCursor.y--;
            }
        }

        if (keyboard.getClearState("Z") || keyboard.getClearState("z")) {
            if (this.targetCursor.x > 0) {
                this.targetCursor.x--;
            }
        }

        if (keyboard.getClearState("C") || keyboard.getClearState("c")) {
            this.targetCursor.x++;
        }

        if (keyboard.getClearState("<") || keyboard.getClearState(",")) {
            this.display.terminal.scrollUp();
        }

        if (keyboard.getClearState(">") || keyboard.getClearState(".")) {
            this.display.terminal.scrollDown();
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
        let cursor = new THREE.Vector2(0, 0);

        let tableData = new TableData();

        this.printChild(doc.children[0], keyboard, cursor, false, false, tableData);

        // Add default 'back' and 'exit' selection.
        if (this.menuStack.length > 1) {
            cursor.x = 0;
            if (this.targetCursor.y == cursor.y) {
                this.targetCursor.x = 0;
            }
            let selected = this.targetCursor.equals(cursor);
            this.display.terminal.println("\tBack", selected);
            if (selected) {
                this.display.terminal.scrollToCurrent();
                if (this.isClicked(keyboard)) {
                    this.popMenu();
                    return;
                }
            }
            cursor.y++;
        }

        cursor.x = 0;
        if (this.targetCursor.y == cursor.y) {
            this.targetCursor.x = 0;
        }
        let selected = this.targetCursor.equals(cursor);
        if (null == this.display.game.ship.dockedTo()) {
            this.display.terminal.println("\tExit", selected);
            if (selected && this.isClicked(keyboard)) {
                this.display.terminalEnable(false);
                this.display.game.togglePaused();
                return;
            }
        } else {
            this.display.terminal.println("\tUndock", selected);
            if (selected && this.isClicked(keyboard)) {
                this.display.game.ship.undock();
                return;
            }
        }
        if (selected) {
            this.display.terminal.scrollToCurrent();
        }

        this.maxYCursor = cursor.y;
    }

    // Do the specifics for each child element type.
    // Returns number of selectable items within child.
    // ToDo. Really should be driven of a table mappinng tag to 'features'.
    printChild(child, keyboard, cursor, highlight, centered, tableData) {
        let result = new ElementResult();

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
            case "button":
            case "BUTTON":
            case "a":
            case "A":
                selectable = true;
                break;

            default:
                break
        }

        if (selectable) {
            result.selectableCount++;
        }

        // handle table related stuff.
        switch (child.nodeName) {
            case "table":
            case "TABLE":
                // Start a new table.
                tableData.colWidths = new Array;
                break;

            case "TR":
            case "tr":
                tableData.colNumber = 0;
                break;

            default:
                break;
        }


        // Are we the element at target cursor?
        let clicked = false;
        if (selectable && this.targetCursor.equals(cursor)) {
            highlight = !highlight;
            if (this.isClicked(keyboard)) {
                clicked = true;
            }
        }

        // In some cases print a line feed.
        let lfReqd = false;
        switch (child.nodeName) {
            case "li":
            case "LI":
            case "tr":
            case "TR":
            case "p":
            case "P":
            case "br":
            case "BR":
                lfReqd = true;
                break;

            default:
                break
        }

        // console.log(child.tagName + " " + this.boundedCursor.x + " " + + this.boundedCursor.y + " " + cursor.x + " " + cursor.y + " " + clicked + " " + highlight)

        // Print/activate child.
        switch (child.nodeName) {
            case "script":
            case "SCRIPT":
                // Invoke script and print output output
                let scriptName = child.attributes.src;

                let op = "";
                if (1 == child.attributes.length) {
                    op = eval(scriptName.nodeValue).printMenu();
                } else {
                    // Build up arg list.
                    let args = new Array();
                    // Don't include src.
                    for (let i = 1; i < child.attributes.length; i++) {
                        args.push(eval(child.attributes[i].nodeValue));
                    }

                    op = eval(scriptName.nodeValue).printMenu.apply(this, args);
                }

                let childDoc = MenuSystem.parser.parseFromString(op, "text/xml");
                result.selectableCount += this.printChild(childDoc, keyboard, cursor, false, false, tableData);

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
                        throw new BugError("No HREF in link.");
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
                result.width += child.textContent.length;
                break;

            case "button":
            case "BUTTON":
                if (clicked) {
                    let action = null;

                    for (let i = 0; i < child.attributes.length; i++) {
                        let attrib = child.attributes[i];
                        if (attrib.specified) {
                            if (attrib.name === "onclick") {
                                action = attrib.value;
                            }
                        }
                    }

                    try {
                        eval(action + ";");
                    }

                    catch (e) {
                        if (e instanceof GameError) {
                            // Display it
                            this.lastError = e;
                            this.pushMenu(errorMenu);
                        } else {
                            // Pass it on
                            throw (e);
                        }
                    }
                }
                break;

            default:
                break;
        }

        let op = this.printChildren(child, keyboard, cursor, highlight, centered, tableData);

        // Table related stuff
        switch (child.nodeName) {
            case "th":
            case "TH":
                // Headings define col widths.
                tableData.colWidths.push(op.width);
                tableData.colNumber++;
                break;

            case "td":
            case "TD":
                // Pad if necessary
                while (op.width < tableData.colWidths[tableData.colNumber]) {
                    this.display.terminal.print(" ", highlight, centered);
                    op.width++;
                }
                tableData.colNumber++;
                break;

            default:
                break;
        }

        result.selectableCount += op.selectableCount;
        result.width += op.width;

        if (lfReqd) {
            // Move display down
            this.display.terminal.print("\n", false, false);
        }

        // If this is the current line limit X cursor to available item count.
        if (this.targetCursor.y == cursor.y) {
            if (result.selectableCount > 0) {
                if (this.targetCursor.x > result.selectableCount) {
                    this.targetCursor.x = result.selectableCount;
                }
            }
        }

        // If necessary scroll to element just printed.
        if (selectable) {
            if (this.targetCursor.equals(cursor)) {
                this.display.terminal.scrollToCurrent();
            }
        }

        // If there was anything selectable also move cursor.
        if (result.selectableCount > 0) {
            if (lfReqd) {
                cursor.y++;
                cursor.x = 0;
                result.selectableCount = 0;
            } else {
                if (selectable) {
                    cursor.x++;
                }
            }
        }

        return (result);
    }

    // Print the child element
    printChildren(parent, keyboard, cursor, highlight, centered, tableData) {
        let result = new ElementResult();
        for (let child of parent.childNodes) {
            let op = this.printChild(child, keyboard, cursor, highlight, centered, tableData);
            result.selectableCount += op.selectableCount;
            result.width += op.width;
        }

        return (result);
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

    // Get textual lenght of an element
    static getTextLength(elem) {
        let doc = MenuSystem.parser.parseFromString(elem, "text/xml");
        return (MenuSystem.getChildTextLength(doc));
    }

    static getChildTextLength(doc) {
        let length = 0;

        for (let i = 0; i < doc.childElementCount; i++) {
            let child = doc.children[i];
            if (0 == child.childElementCount) {
                return (child.textContent.length);
            } else {
                length += MenuSystem.getChildTextLength(child);
            }
        }
        return (length);
    }
}

export default MenuSystem;