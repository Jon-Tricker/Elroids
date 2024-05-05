// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import Keyboard from "./keyboard.js";
import Universe from './universe.js'
import Game from './game.js'
import Player from './player.js'
import MyCamera from './Scenery/myCamera.js'

// Some plumbing to get passed parameters.
var scripts = document.getElementsByTagName('script');
var lastScript = scripts[scripts.length - 1];
var scriptName = lastScript;
var rockCount = parseInt(scriptName.getAttribute('rockCount'));
var uniSize = parseInt(scriptName.getAttribute('uniSize'));
var rockStyle = scriptName.getAttribute('rockStyle');
var soundOn = scriptName.getAttribute('soundOn');
var safe = false;

Universe.setSize(uniSize);

// Create the game objects
const player = new Player();
const game = new Game(rockCount, rockStyle, safe, player, soundOn);

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
  if (game.soundOn && (undefined == Universe.getListener())) {
    Universe.loadSoundBuffers();

    let listener = new THREE.AudioListener();
    Universe.setListener(listener);
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