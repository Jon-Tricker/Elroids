// Class handling all the graphical bits and pieces.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import * as THREE from 'three';
import MyCamera from './myCamera.js'
import WrapBox from "./wrapBox.js";
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

class MyScene extends THREE.Scene {

  camera = null;
  light;
  ambientLight;

  // Main 3D renderer
  renderer;

  // Renderer for 2D labels
  labelRenderer;

  sizes;
  game;
  myCanvas;
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

    // Create label renderer.
    this.labelRenderer = new CSS2DRenderer({ canvas });
    this.labelRenderer.setSize(this.sizes.width, this.sizes.height);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0px';
    document.body.appendChild(this.labelRenderer.domElement);

    if (wrapBoxOn) {
      let wrapBoxSize = this.game.universe.systemSize * 2;
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
    this.labelRenderer.render(this, this.camera);
  }

  addLights() {
    // Create a point light source.
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.ambientLight = new THREE.AmbientLight(0xfffffff, 0.5);

    // Move light away from scene
    this.light.position.set(0, 0, this.game.universe.systemSize * 2);

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
        super.remove(this.camera);
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
        this.camera = new MyCamera(this.sizes, type, this.game.getShip());
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

    if (undefined != this.game.getListener()) {
      this.getCamera().addListener(this.game.getListener());
    }

    // this.renderer.render(this, this.camera);
    // this.labelRenderer.render(this, this.camera);
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

    // Adjust renderers
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.labelRenderer.setSize(this.sizes.width, this.sizes.height);
  }

  // Remove an item
  remove(item) {
    if (undefined != item.label) {
      // If item has a label remove it and re-add it.
      // This is a work round to a problem (bug?). Looks like a CSS2DObject that is part of a group is not removed when it parent group is removed from a scene.
      item.remove(item.label);
      item.add(item.label);
    }
    super.remove(item);
  }

  animate() {
    // Update camera position
    this.camera.updatePosition();
    
    // Re-render
    this.renderer.render(this, this.camera);
    this.labelRenderer.render(this, this.camera);
  }
}

export default MyScene;