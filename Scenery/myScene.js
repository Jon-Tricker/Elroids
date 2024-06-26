// Class handling all the graphical bits and pieces.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import MyCamera from './myCamera.js'
import SkyBox from "./skyBox.js";
import WrapBox from "./wrapBox.js";
import Universe from "../universe.js";

class MyScene extends THREE.Scene {

  camera = null;
  light;
  ambientLight;
  renderer;
  sizes;
  game;
  myCanvas;
  skyBox;
  wrapBox;


  constructor(game, wrapBoxOn) {
    super();

    this.game = game;

    // Resize to fit entire window
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    this.addLights();
    // Add scene to web pages canvas
    const canvas = document.querySelector('.screenclass');
    this.myCanvas = canvas;

    // Create threeJS 'renderer'
    this.renderer = new THREE.WebGLRenderer({ canvas });  // GL1?
    this.renderer.setSize(this.sizes.width, this.sizes.height);

    // Create static elements.
    let skyBoxSize = Universe.UNI_SIZE * 4;
    this.skyBox = new SkyBox(skyBoxSize, game, true);
    this.add(this.skyBox);

    if (wrapBoxOn) {
      let wrapBoxSize = Universe.UNI_SIZE * 2;
      this.wrapBox = new WrapBox(wrapBoxSize, true);
      this.add(this.wrapBox);
    }

    // Make image a bit smoother.
    // renderer.setPixelRatio(2);

    // Enable shadows.
    this.renderer.shadowMap.enabled = true;

    // Initially no ship so use the fixed camera.
    this.setCamera(MyCamera.DUMMY);

    // ... and render
    this.renderer.render(this, this.camera);
  }

  addLights() {
    // Create a point light source.
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.ambientLight = new THREE.AmbientLight(0xfffffff, 0.5);

    // Move light away from scene
    this.light.position.set(0, 0, Universe.UNI_SIZE * 2);

    // Enable shadows
    this.light.castShadow = true;

    // Add light to scene
    this.add(this.light);
    this.add(this.ambientLight);
  }

  getCamera() {
    return (this.camera);
  }

  setCamera(type) {

    // Remove any existing, non rotating, camera ... and let GC deal with it (I hope).
    if (null != this.camera) {
      if (this.camera.getIsFixedRotation()) {
        this.remove(this.camera);
      }
    }

    switch (type) {
      // Fotr these cases get existing cameras.
      case MyCamera.CHASE:
        this.camera = this.game.getShip().getChaseCamera();
        this.game.displays.hudEnable(false);
        break;

      case MyCamera.PILOT:
        this.camera = this.game.getShip().getPilotCamera();
        this.game.displays.hudEnable(true);
        break;

      case MyCamera.DUMMY:
        this.camera = new MyCamera(this.sizes, type, null);
        break;

      default:
        // Else get a new camera.
        this.camera = new MyCamera(this.sizes, type, this.game.getShip());
        this.game.displays.hudEnable(false);
        break;
    }

    if (this.camera.getIsFixedRotation()) {
      // Add camera to scene. It does not rotate
      this.add(this.camera);
    }

    // Resize camera for curent window size.
    this.resizeCamera();

    // Listener to handle viewport re-sizes
    window.addEventListener("resize", () => {
      this.game.displays.resize();
      this.resizeCamera();
    })

    if (undefined != Universe.getListener()) {
      this.getCamera().addListener(Universe.getListener());
    }

    this.renderer.render(this, this.camera);
  }

  addListener(list) {
    // this.add(list);
    this.camera.addListener(list);
  }

  resizeCamera() {
    // Get new view port size
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    // Adjust camera
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    // Adjust renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height);
  }

  animate() {
    // Update camera position
    this.camera.updatePosition();

    if (!this.camera.getIsFixedLocation()) {
      // Move sky box with ship. So we never get closer to it.
      this.skyBox.position.set(this.game.getShip().position.x, this.game.getShip().position.y, this.game.getShip().position.z);
    }

    // Re-render
    this.renderer.render(this, this.camera);
  }


}

export default MyScene;