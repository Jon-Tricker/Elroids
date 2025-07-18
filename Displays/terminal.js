// Ship control terminal screen (a, very limited, vt100 simulation)

// Let's take a modern GUI and reduce it to a 'corestore punk' interface so the younglings can learn what it was like :-).

import * as THREE from 'three';
import DarkPanel from './Utils/darkPanel.js';
import Game from '../game.js';

// Scale factor relative to parent.
const SCALE_FACTOR = 0.9;

const TEXT_COLS = 80;
const TEXT_ROWS = 24;

const TAB_WIDTH = 4;

class Terminal extends DarkPanel {

    doc;

    // Character size.
    pt;
    decenderHt;

    // Character buffer. List of lines.
    lineBuffer = new Array();

    // x and y border widths.
    border;

    // Write cursor.
    cursor = new THREE.Vector2(0, 0);

    // Non positional sounds.
    sounds = new Map();

    // Line in buffer to display from.
    firstLine;

    // Size of windoe.
    rows = TEXT_ROWS;
    cols = TEXT_COLS;

    // Maximum number of lines in buffer.
    maxBufLines = 200;

    // Scroll to cursor mode
    scrollToCursorMode = true;

    constructor(game, ctx, doc, defaultColour, rows, cols) {
        super(ctx, defaultColour, true);
        this.game = game;
        this.doc = doc;
        this.firstLine = 0;

        if (undefined != rows) {
            this.rows = rows;
        }

        if (undefined != cols) {
            this.cols = cols;
        }
    }

    resize(parentWidth, parentHeight) {
        let width = parentWidth * SCALE_FACTOR;
        let height = parentHeight * SCALE_FACTOR;

        // Want 4:3 aspect ratio
        if ((width * 3) > (height * 4)) {
            width = height * 4 / 3;
        } else {
            height = width * 3 / 4;
        }

        let x = (parentWidth - width) / 2;
        let y = (parentHeight - height) / 2;
        super.resize(width, height, x, y);


        this.doc.width = parentWidth;
        this.doc.height = parentHeight;

        // Set up border
        this.border = new THREE.Vector2(width * 0.02, height * 0.02);

        // Calculate individual character sizes for the above monospaced font.
        // Numbers here are a bit 'trial and error'.
        this.pt = new THREE.Vector2((width - (2 * this.border.x)) / this.cols, (height - (2 * this.border.y)) / this.rows);
        this.ctx.font = this.pt.y * 3 / 4 + "px monospace";
        this.decenderHt = this.pt.y * 0.2;
    }

    animate(date, keyboard) {
        super.animate();

        // Display a grid for testing.
        // this.displayGrid();

        this.displayBuffer(this.lineBuffer)
    }

    // Print a line into the buffer
    println(text, highlight, centered) {
        this.print(text, highlight, centered);
        this.print("\n", false, false);
    }

    print(text, highlight, centered) {

        if (highlight === undefined) {
            highlight = false;
        }

        if (centered === undefined) {
            centered = false;
        }

        // Not going to work if any control characters. For that pass a space separated string.
        if (centered) {
            this.cursor.x = Math.floor((this.cols - text.length) / 2);
        }


        for (let i = 0; i < text.length; i++) {
            // console.log(text.charCodeAt(i))
            // Handle special characters.
            switch (text.charCodeAt(i)) {
                // CR
                case 0x0D:
                    this.cursor.x = 0;
                    break;

                // CR/LF
                case 0x0A:
                    this.linefeed();
                    this.cursor.x = 0;
                    break;

                // Tab
                case 0x09:
                    for (let j = 0; j < TAB_WIDTH; j++) {
                        this.addChar(" ", highlight);
                    }
                    break;

                // Convert escaped things.
                case 0x26:  // Ampersand
                    if (text.length > (i + 2)) {
                        if ((text[i + 1] == 'l') && (text[i + 2] == 't')) {
                            this.addChar("<", highlight);
                            i += 2;
                        }

                        if ((text[i + 1] == 'g') && (text[i + 2] == 't')) {
                            this.addChar(">", highlight);
                            i += 2;
                        }

                        // Deal with optional (I think) semi colon
                        if ((text.length > i + 1) && (text[i + 1] == ';')) {
                            i++;
                        }
                    }
                    break;

                default:
                    this.addChar(text[i], highlight);
                    break;
            }

        }
    }

    // Linefeed
    // For now pages are of unlimited size so buffer can grow until cleared.
    linefeed() {// Add new row
        this.lineBuffer.push(new Array());

        if (this.lineBuffer.length < this.maxBufLines) {
            // Move cursor down.
            this.cursor.y++;
        } else {
            // Move buffer up.
            this.lineBuffer.shift();
            if (0 < this.firstLine) {
                this.firstLine--;
            }
        }
    }

    // Get row for current cursor position.
    getCurrentRow() {
        // Create any missing rows
        while (this.lineBuffer.length <= this.cursor.y) {
            let row = new Array();
            this.lineBuffer.push(row);
        }
        return (this.lineBuffer[this.cursor.y]);
    }

    addChar(char, highlight) {
        let row = this.getCurrentRow();

        let cell = new CharCell(char, highlight);

        while (row.length < this.cursor.x) {
            // Pad with spaces.
            row.push(new CharCell(" ", false));
        }

        row.push(cell);

        // Handle row wrap
        if (this.cols < this.cursor.x++) {
            this.cursor.y++;
            this.cursor.x = 0;
        }
    }

    clearScreen() {
        this.lineBuffer = new Array();
        this.cursor.x = 0;
        this.cursor.y = 0;
    }

    // Clear screen and reset scroll
    resetScreen() {
        this.clearScreen();
        this.firstLine = 0;
    }

    displayBuffer(buf) {
        for (let line = this.firstLine; (line < this.firstLine + this.rows) && (buf.length > line); line++) {
            let row = buf[line];
            for (let col = 0; col < row.length; col++) {
                this.displayCell(row[col], col, line - this.firstLine);
            }
        }
    }

    // Display a character at a location.
    displayCell(cell, x, y) {
        // let oldStroke = this.ctx.strokeStyle; 
        let oldFill = this.ctx.fillStyle;

        if (cell.highlight) {
            this.highlightCell(x, y);
            this.ctx.fillStyle = this.defaultBackground;
        }

        this.ctx.fillText(cell.char, this.x + this.border.x + (this.pt.x * x), this.y + this.border.y - this.decenderHt + (this.pt.y * (y + 1)));

        // Put colous back.
        // this.ctx.strokeStyle = oldStroke;
        this.ctx.fillStyle = oldFill;
    }

    displayGrid() {
        for (let i = 0; i < this.cols + 1; i++) {
            this.ctx.moveTo(this.x + this.border.x + this.pt.x * i, this.y + this.border.y);
            this.ctx.lineTo(this.x + this.border.x + this.pt.x * i, this.y - this.border.y + this.height);
        }

        for (let i = 0; i < this.rows + 1; i++) {
            this.ctx.moveTo(this.x + this.border.x, this.y + this.border.y + this.pt.y * i);
            this.ctx.lineTo(this.x - this.border.x + this.width, this.y + this.border.y + this.pt.y * i);
        }

        this.ctx.stroke();
    }

    getCellLocation(x, y) {
        let loc = new THREE.Vector2();
        loc.x = this.x + this.border.x + (this.pt.x * x);
        loc.y = this.y + this.border.y + (this.pt.y * y);
        return (loc);
    }

    highlightCell(x, y) {
        let loc = this.getCellLocation(x, y);
        this.ctx.fillRect(loc.x, loc.y, this.pt.x + 1, this.pt.y + 1);
    }

    scrollDown() {
        if (this.lineBuffer.length > this.firstLine + this.rows) {
            this.firstLine++;
        }
    }

    scrollUp() {
        if (0 < this.firstLine) {
            this.firstLine--;
        }
    }

    setScrollToCursor(mode) {
        this.scrollToCursorMode = mode;
    }

    scrollToCursor() {
        if (this.scrollToCursorMode) {
            // If Y cursor outside current scroll window.
            if (this.cursor.y < this.firstLine) {
                // Moving up ... cursor line at top.
                this.firstLine = this.cursor.y;
            } else {
                if (this.cursor.y > this.firstLine + this.rows) {
                    // Moving down ... cursor line at bottom.
                    this.firstLine = this.cursor.y - this.rows + 1;
                }
            }
        }
    }

    // Simple non-directional sound.
    // Unlike sounds emited by Items which may be 3D.
    playSound(name, volume, loop) {
        if (!this.game.soundOn) {
            return (false);
        }

        let list = this.game.getListener();
        if ((undefined == list)) {
            // Dont have a listener yet ... give up. without loading
            return (false);
        }

        // We are going to play a sound. Get the buffer.
        let sound = this.sounds.get(name);
        if (undefined == sound) {
            // Need to create/attach PositionalAudio for this Item.
            let buffer = Game.sounds.get(name);
            if (null == buffer) {
                // Buffer not yet loaded into Univese
                return (false);
            }

            sound = new THREE.Audio(list)
            sound.setBuffer(buffer);
            sound.stop();

            this.sounds.set(name, sound);
        }

        if (undefined != volume) {
            sound.setVolume(volume);
        }

        if (undefined != loop) {
            sound.setLoop(loop);
        }

        // Play it
        if (!sound.isPlaying) {
            sound.play();
        }

        return (true)
    }

    stopSound(name) {
        let sound = this.sounds.get(name);
        if (undefined != sound) {
            sound.stop();
        }
    }
}

class CharCell {
    char;
    highlight;

    constructor(char, highlight) {
        this.char = char;
        this.highlight = highlight;
    }
}

export default Terminal;