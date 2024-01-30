// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Keyboard from "./keyboard.js";
import Universe from './universe.js'
import Game from './game.js'
import MyCamera from './Scenery/myCamera.js'

// Some plumbing to get passed parameters.
var scripts = document.getElementsByTagName('script');
var lastScript = scripts[scripts.length-1];
var scriptName = lastScript;
var rockCount = parseInt(scriptName.getAttribute('rockCount'));
var uniSize = parseInt(scriptName.getAttribute('uniSize'));
var rockStyle = scriptName.getAttribute('rockStyle');
var safe = false;

Universe.setSize(uniSize);

// Create the game objects
const game = new Game(rockCount, rockStyle, safe);

// Add event listener on clicks.
// It takes a while for auto repeat to kick in. Also we don't know how fast it will be. So
// handle held down kets ourself.
window.addEventListener('keydown', (event) => {
  var name = event.key;
  var code = event.code;
  // Alert the key name and key code on keydown2key
  Keyboard.keyDown(event)

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