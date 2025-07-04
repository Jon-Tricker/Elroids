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
import { componentsMenu } from './Menus/componentsMenu.js';
import { ComponentsMenu } from './Menus/componentsMenu.js';
import { ComponentDetailsMenu } from './Menus/compPurchaseMenu.js';
import { compPurchaseMenu } from './Menus/compPurchaseMenu.js';
import { CompPurchaseMenu } from './Menus/compPurchaseMenu.js';
import { goodsPurchaseMenu } from './Menus/goodsPurchaseMenu.js';
import { GoodsPurchaseMenu } from './Menus/goodsPurchaseMenu.js';
import { cargoMenu } from './Menus/cargoMenu.js';
import { CargoMenu } from './Menus/cargoMenu.js';
import { starSystemsMenu, StarSystemsMenu } from './Menus/starSystemsMenu.js';
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
    // Total number of lines.
    maxYCursor = 0;

    // Ugly variable used for passing 'last error' argument.
    lastError = null;

    static parser = new DOMParser();

    // Log some detail
    log = false;

    constructor(display) {
        this.display = display;
        if (null != this.getShip().getDockedWith()) {
            this.pushMenu(dockedMenu);
        } else {
            this.pushMenu(topMenu);
        }
    }

    getShip() {
        return (this.display.getShip());
    }

    getGame() {
        return (this.display.getGame());
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
        let terminal = this.display.terminal;

        if (keyboard.getClearState("X") || keyboard.getClearState("x")) {
            terminal.setScrollToCursor(true);
            if (this.targetCursor.y < this.maxYCursor) {
                this.targetCursor.y++;
            }
        }

        if (keyboard.getClearState("S") || keyboard.getClearState("s")) {
            terminal.setScrollToCursor(true);
            if (this.targetCursor.y > 0) {
                this.targetCursor.y--;
            }
        }

        if (keyboard.getClearState("Z") || keyboard.getClearState("z")) {
            terminal.setScrollToCursor(true);
            if (this.targetCursor.x > 0) {
                this.targetCursor.x--;
            }
        }

        if (keyboard.getClearState("C") || keyboard.getClearState("c")) {
            terminal.setScrollToCursor(true);
            this.targetCursor.x++;
        }

        if (keyboard.getClearState("<") || keyboard.getClearState(",")) {
            terminal.setScrollToCursor(false);
            terminal.scrollUp();
        }

        if (keyboard.getClearState(">") || keyboard.getClearState(".")) {
            terminal.setScrollToCursor(false);
            terminal.scrollDown();
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
        if (this.log) {
            console.log("Start doc");
        }

        this.maxYCursor = 0;

        // this.dumpXmlDoc(doc)

        // Cursor to first field
        let cursor = new THREE.Vector2(0, 0);

        let tableData = new TableData();

        this.printChildren(doc.children[0], keyboard, cursor, false, false, tableData);

        this.printDefaults(keyboard, cursor);
    }

    // Print default, back, exit etc. buttons.
    printDefaults(keyboard, cursor) {
        if (this.menuStack.length > 1) {
            cursor.x = 0;
            let selected = this.targetCursor.equals(cursor);
            this.display.terminal.print("\t", false);
            this.display.terminal.print("Back", selected);
            if (selected) {
                this.display.terminal.scrollToCursor();
                if (this.isClicked(keyboard)) {
                    this.popMenu();
                    return;
                }
            }
            cursor.x++;
        }

        this.display.terminal.print("\t", false);
        let selected = this.targetCursor.equals(cursor);
        if (null == this.getShip().getDockedWith()) {
            this.display.terminal.print("Exit", selected);
            if (selected && this.isClicked(keyboard)) {
                this.display.game.togglePaused();
                return;
            }
        } else {
            this.display.terminal.print("Undock", selected);
            if (selected && this.isClicked(keyboard)) {
                this.getShip().undock();
                return;
            }
        }
        cursor.x++;
        if (selected) {
            this.display.terminal.scrollToCursor();
        }

        this.limitX(cursor);

        this.maxYCursor = cursor.y;
    }

    // Print the child elements
    printChildren(parent, keyboard, cursor, highlight, centered, tableData) {
        let result = new ElementResult();
        for (let child of parent.childNodes) {
            let op = this.printChild(child, keyboard, cursor, highlight, centered, tableData);
            result.selectableCount += op.selectableCount;
            result.width += op.width;
        }

        return (result);
    }


    // Do the specifics for each child element type.
    // Returns number of selectable items within child.
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

        let selectable = this.isSelectable(child.nodeName);

        let lfReqd = this.isLfReqd(child.nodeName);

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
        if (this.targetCursor.equals(cursor) && selectable) {
            highlight = !highlight;
            if (this.isClicked(keyboard)) {
                clicked = true;
            }
        }

        // Print/activate child.
        switch (child.nodeName) {
            case "script":
            case "SCRIPT":
                let op = this.runScript(child, keyboard, cursor, tableData);
                result.selectableCount += op.selectableCount;
                break;

            case "a":
            case "A":
                if (clicked) {
                    this.followLink(child);
                }
                break;

            case "#text":
                this.display.terminal.print(child.textContent, highlight, centered);
                result.width += child.textContent.length;
                break;

            case "button":
            case "BUTTON":
                if (clicked) {
                    this.clickButton(child, cursor);
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

        if (this.log) {
            console.log("elem " + child.nodeName + " selectable " + selectable + " lfReqd " + lfReqd + " cur.x " + cursor.x + " cur.y " + cursor.y + " targ.x " + this.targetCursor.x + " targ.y " + this.targetCursor.y + " res sel " + result.selectableCount);
        }

        // If necessary scroll to element just printed.
        if (selectable) {
            if (this.targetCursor.equals(cursor)) {
                this.display.terminal.scrollToCursor();
            }
        }

        if (selectable) {
            if (this.targetCursor.y == cursor.y) {
                cursor.x++;
            }
            result.selectableCount++;
        }

        // If there was anything selectable in children also move cursor.
        if (lfReqd) {
            if ((result.selectableCount > 0)) {
                this.limitX(cursor);

                // Next selectable line.
                cursor.y++;
                cursor.x = 0;
                result.selectableCount = 0;
            }
        }

        return (result);
    }

    // Prevent X cursor from being to right of line.
    limitX(cursor) {
        if (this.targetCursor.y == cursor.y) {
            if (this.targetCursor.x > cursor.x - 1) {
                this.targetCursor.x = cursor.x - 1;
            }
        }
    }

    // Run a script
    runScript(script, keyboard, cursor, tableData) {
        let scriptName = script.attributes.src;

        let op = "";
        if (1 == script.attributes.length) {
            op = eval(scriptName.nodeValue).printMenu();
        } else {
            // Build up arg list.
            let args = new Array();
            // Don't include src.
            for (let i = 1; i < script.attributes.length; i++) {
                args.push(eval(script.attributes[i].nodeValue));
            }

            op = eval(scriptName.nodeValue).printMenu.apply(this, args);
        }

        let childDoc = MenuSystem.parser.parseFromString(op, "text/xml");
        return (this.printChild(childDoc, keyboard, cursor, false, false, tableData));
    }

    // Folow a link
    followLink(link) {
        let linkName = null;

        for (let i = 0; i < link.attributes.length; i++) {
            let attrib = link.attributes[i];
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

    // Click a button
    clickButton(button, cursor) {
        let action = null;

        for (let i = 0; i < button.attributes.length; i++) {
            let attrib = button.attributes[i];
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

    // Is element selectable?
    isSelectable(nodeName) {
        switch (nodeName) {
            case "input":
            case "INPUT":
            case "button":
            case "BUTTON":
            case "a":
            case "A":
                return (true);

            default:
                break
        }
        return (false);
    }

    isLfReqd(nodeName) {
        switch (nodeName) {
            case "li":
            case "LI":
            case "tr":
            case "TR":
            case "p":
            case "P":
            case "br":
            case "BR":
                return (true);

            default:
                break
        }
        return (false);
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