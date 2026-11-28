// Copyright (C) Jon Tricker 2023 - 2026
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Keyboard from './Game/Utils/keyboard.js';
import Game from './Game/game.js';
import MyCamera from './Game/Scenery/myCamera.js';

// Some plumbing to get passed parameters.
var scripts = document.getElementsByTagName('script');

// Find a script with the 'rockCount' attribute. Start at the most recent.
// In some environments (e.g. Itch) may not be the last one.
let script;
for (let i = scripts.length - 1; i >= 0; i--) {
  script = scripts[i];
  if (null != script.getAttribute('rockCount')) {
    break;
  }
}

// Get attributes
let rc = script.getAttribute('rockCount');
let rockCount;
if (null != rc) {
  rockCount = parseInt(rc);
}

let ss = script.getAttribute('systemSize');
let systemSize;
if (null != ss) {
  systemSize = parseInt(ss);
}

let startDocked = script.getAttribute('startDocked');
if (null == startDocked) {
  startDocked = undefined;
}

let soundOn = script.getAttribute('soundOn');
if (null == soundOn) {
  soundOn = undefined;
}

let safeMode = script.getAttribute('safeMode');
if (null == safeMode) {
  safeMode = undefined;
}

let challenge = script.getAttribute('challenge');
if (null == challenge) {
  challenge = undefined;
}

// Create the game objects
// Make universe a bit smaller than system. Reduces hyperspace travel times.
const game = new Game(systemSize / 2, systemSize, rockCount, safeMode, soundOn, startDocked, challenge);

// Add event listener on clicks.
// It takes a while for auto repeat to kick in. Also we don't know how fast it will be. So
// handle held down kets ourself.
window.addEventListener('keydown', (event) => {
  var name = event.key;
  var code = event.code;
  // Alert the key name and key code on keydown2key
  Keyboard.keyDown(event)

  // A bit mad but chrome want's all audio to be done as part of a user event.
  // So do it on first key click.
  if (game.soundOn && (undefined == game.getListener())) {
    game.loadSoundBuffers();

    let listener = new THREE.AudioListener();
    game.setListener(listener);
    game.getScene().addListener(listener);
  }

  // Handle camera changes.
  if (Keyboard.getState("1")) {
    game.getScene().setCamera(MyCamera.PILOT);
  }
  if (Keyboard.getState("2")) {
    game.getScene().setCamera(MyCamera.CHASE);
  }
  if (Keyboard.getState("3")) {
    game.getScene().setCamera(MyCamera.STANDOFF);
  }  // Handle camera changes.
  if (Keyboard.getState("4")) {
    game.getScene().setCamera(MyCamera.FIXED);
  }

}, false);

window.addEventListener('keyup', (event) => {
  var name = event.key;
  var code = event.code;
  // Alert the key name and key code on keydown2key
  Keyboard.keyUp(event)
}, false);