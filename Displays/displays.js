// Game and ship display overlays.
import Radar from "./radar.js";
import Universe from '../universe.js'
import Terminal from './terminal.js'
import MenuSystem from './menuSystem.js'

const PAD_LENGTH = 5;
const DEFAULT_DURATION = 2000;

class Message {
    text;

    // Expiry time 
    // 0 if never;
    expiry;

    constructor(text, expiry) {
        this.text = text;
        this.expiry = expiry;
    }
}

class Displays {
    controlsCtx;
    hudCtx;
    statusCtx
    msgCtx;
    terminalCtx;

    height;
    pt;
    game;

    status;
    hud;
    hudIsOn = false;
    terminalIsOn = false;
    controls;
    msg;

    // Messasge queue
    msgs;

    terminal;
    menuSystem;

    radar;

    // Game control variables.

    constructor(game) {
        this.game = game;
        this.msgs = new Array();

        // Get and scale page elements.
        this.controls = document.querySelector('.controlsclass');
        this.controlsCtx = this.controls.getContext("2d");

        this.hud = document.querySelector('.hudclass');
        this.hudCtx = this.hud.getContext("2d");

        this.status = document.querySelector('.statusclass');
        this.statusCtx = this.status.getContext("2d");

        this.msg = document.querySelector('.messagesclass');
        this.msgCtx = this.msg.getContext("2d");

        let terminalDoc = document.querySelector('.terminalclass');
        let terminalCtx = terminalDoc.getContext("2d");
        this.terminal = new Terminal(this.game, terminalCtx, terminalDoc, "lightgreen");

        this.radar = new Radar(this.game, this.statusCtx, "red");

        this.resize();
    }

    resize() {
        this.height = window.innerHeight * 0.05;
        if (this.height < 10) {
            this.height = 10;
        }
        this.pt = this.height * 0.8;

        this.controls.width = window.innerWidth;
        this.controls.height = this.height;

        this.hud.width = window.innerWidth;
        this.hud.height = window.innerHeight;

        this.status.width = window.innerWidth;
        this.status.height = this.height * 5;

        this.msg.width = window.innerWidth;
        this.msg.height = window.innerHeight;

        this.terminal.resize(window.innerWidth, window.innerHeight);

        this.radar.resize(this.status.width, this.status.height);

        this.controlsCtx.strokeStyle = "yellow";
        this.controlsCtx.font = this.pt + "px serif";

        // Create head up display. 
        this.hudCtx.strokeStyle = "red";
        this.hudCtx.font = this.pt + "px serif";

        // Create ship status  display
        this.statusCtx.strokeStyle = "red";
        this.statusCtx.font = this.pt + "px serif";

        // Create game messages display.
        this.msgCtx.strokeStyle = "yellow";
        this.msgCtx.font = this.pt + "px serif";
    }

    // Set terminal state.
    terminalEnable(state) {
        this.terminalIsOn = state;
        if (state) {
            this.menuSystem = new MenuSystem(this);
        } else {
            // Clear up old terminal
            this.terminal.clearBox();
            this.meunSystem = null;
        }
    }

    animate(date, keyboard) {
        this.animateControls();
        if (this.hudIsOn) {
            this.animateHud();
        }

        if (this.msgs.length > 0) {
            this.animateMsg(date);
        }

        this.animateStatus();

        if (this.terminalIsOn) {
            this.terminal.animate(date, keyboard);
            this.menuSystem.animate(date, keyboard);
        }

    }

    animateControls() {
        this.controlsCtx.clearRect(0, 0, this.controls.width, this.controls.height);

        // Dim transparent background
        this.controlsCtx.globalAlpha = 0.5;
        this.controlsCtx.fillStyle = "#000000";
        this.controlsCtx.fillRect(0, 0, this.controls.width, this.controls.height);
        this.controlsCtx.globalAlpha = 1;
        this.controlsCtx.fillStyle = this.defaultColour;

        this.controlsCtx.strokeText("V" + this.game.getVersion() + "    Score:" + this.printNum(this.game.player.getScore()) + "    Credits:" + this.printNum(this.game.player.getCredits()) + "    Frame rate:" + this.printNum(Universe.getActualAnimateRate()) + "/s", 20, this.height * 0.9);
    }

    hudEnable(state) {
        this.hudIsOn = state;

        // One animate to allow it to (dis)apear.
        this.animateHud();
    }

    addMessage(message, duration) {

        if (duration === undefined) {
            duration = DEFAULT_DURATION;
        }

        let expiry;
        if (0 != duration) {
            expiry = Universe.getTime() + duration;
        } else {
            expiry = 0;
        }

        let msg = new Message(message, expiry);

        this.msgs.push(msg);
    }

    animateHud() {
        /* TODO: HUD not quite right yet */
        let ctx = this.hudCtx;
        ctx.clearRect(0, 0, this.hud.width, this.hud.height);
        if (this.hudIsOn) {
            let left = this.hud.width / 2 - this.height;
            let top = this.hud.height / 2 - this.height;
            let right = left + this.height * 2;
            let bottom = top + this.height * 2;
            let len = this.height / 2;
            ctx.strokeRect(left, top, this.height * 2, this.height * 2);

            ctx.beginPath();
            ctx.moveTo(left - len, top - len);
            ctx.lineTo(left + len, top + len);
            ctx.moveTo(right + len, top - len);
            ctx.lineTo(right - len, top + len);
            ctx.moveTo(left - len, bottom + len);
            ctx.lineTo(left + len, bottom - len);
            ctx.moveTo(right + len, bottom + len);
            ctx.lineTo(right - len, bottom - len);

            ctx.closePath();
            ctx.stroke();
        }
    }

    animateStatus() {
        this.statusCtx.clearRect(0, 0, this.status.width, this.status.height);

        let ship = this.game.ship;
        this.statusCtx.strokeText("Position:", this.status.width * 0.1, this.status.height * 0.9 - this.pt);
        if (null == ship.dockedWith) {
            this.statusCtx.strokeText(this.printNum(ship.location.x) + "," + this.printNum(ship.location.y) + "," + this.printNum(ship.location.z), this.status.width * 0.1, this.status.height * 0.9);
        } else {
            this.statusCtx.strokeText("Docked", this.status.width * 0.1, this.status.height * 0.9);
        }
        this.statusCtx.strokeText("Speed:" + this.printNum(ship.speed.length()) + " m/s.", this.status.width * 0.7, this.status.height * 0.9 - this.pt);
        this.statusCtx.strokeText("Hull status:" + this.printNum(ship.hullSet[0].status) + "%", this.status.width * 0.7, this.status.height * 0.9);
        if (this.hudIsOn) {
            this.radar.animate();
        }
    }

    animateMsg(date) {
        this.msgCtx.clearRect(0, 0, this.msg.width, this.msg.height);

        let lineNo = 0;
        for (let i = 0; i < this.msgs.length; i++) {

            let msg = this.msgs[i];

            if ((0 != msg.expiry) && (date >= msg.expiry)) {
                // Remove it.
                this.msgs.splice(i, 1);
            } else {
                // Display it
                this.msgCtx.strokeText(msg.text, this.msg.width / 2 - (this.pt / 2 * msg.text.length) / 2, this.msg.height / 2 - this.pt * (this.msgs.length / 2 - lineNo - 1));
                lineNo++;
            }
        }
    }

    printNum(num) {
        return (Math.floor(num).toString().padStart(PAD_LENGTH));
    }
}

export default Displays;