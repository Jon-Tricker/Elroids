// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Keyboard from './Game/Utils/keyboard.js';
import Game from './Game/game.js';
import MyCamera from './Game/Scenery/myCamera.js';

// Some plumbing to get passed parameters.
var scripts = document.getElementsByTagName('script');
var lastScript = scripts[scripts.length - 1];
var scriptName = lastScript;
var rockCount = parseInt(scriptName.getAttribute('rockCount'));
var uniSize = parseInt(scriptName.getAttribute('uniSize'));
var rockStyle = scriptName.getAttribute('rockStyle');
var startDocked = scriptName.getAttribute('startDocked');
var soundOn = scriptName.getAttribute('soundOn');
var safe = false;

// Create the game objects
// For the moment universe and system are the same size.
const game = new Game(uniSize, uniSize, rockCount, rockStyle, safe, soundOn, startDocked);

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