// Camera and listener mechanics
import * as THREE from 'three';
import Universe from '../universe.js';

class MyCamera extends THREE.PerspectiveCamera {

    // Camera types.
    // TODO really should be an ENUM.

    // Behind and rotated with ship
    static PILOT = 0;
    // Behind and rotated with ship
    static CHASE = 1;
    // At a fixed z ofset from ship
    static STANDOFF = 2;
    // At a fixed point in space
    static FIXED = 3;
    // Minimal camera used during game bootstrap.
    static DUMMY = 3;

    static STANDOFF_DIST = 200;

    type;
    ship;
    isFixedLocation;
    isFixedRotation;
    listener;

    constructor(sizes, type, ship) {

        let sz = 10000;          // Some random default value
        if (undefined != ship) {
            sz = ship.system.systemSize;
        }

        super(45, sizes.width / sizes.height, 0.1, sz * 4 * Universe.CBRT_THREE);

        switch (type) {
            case MyCamera.PILOT:
                this.createPilot(ship);
                break;
            case MyCamera.CHASE:
                this.createChase(ship);
                break;
            case MyCamera.STANDOFF:
                this.createStandoff();
                break;
            case MyCamera.FIXED:
                this.createFixed();
                break;
            case MyCamera.DUMMY:
                break;

            default:
                console.log("Invalid camera type.")
        }

        this.type = type;
        this.ship = ship;
    }

    addListener(list) {
        // list.position.set(this.position);
        this.add(list);
    }

    createChase(ship) {
        // Create a fixed camera
        this.createFixed();

        // Patch it to match ship.
        this.isFixedLocation = false;
        this.isFixedRotation = false;

        // Chase plane behind and a little above.
        this.position.x = -MyCamera.STANDOFF_DIST;
        this.position.z = 0;

        // Look at the ship
        this.lookAt(ship.position);

        // Rotate ship from initial position to same way up as ship.
        this.rotateZ(-Math.PI / 2);

        // Move a little above but keep orientation parallel
        this.position.z = MyCamera.STANDOFF_DIST / 4;
    }

    createPilot(ship) {
        // Create a fixed camera
        this.createFixed();

        // Patch it to match ship.
        this.isFixedLocation = false;
        this.isFixedRotation = false;

        // Behind so it can lookAt.
        this.position.x = -1;
        this.position.z = 0;

        // Look at the ship
        this.lookAt(ship.position);

        // Rotate ship from initial position to same way up as ship.
        this.rotateZ(-Math.PI / 2);

        // Move juat ahead of ship. 
        this.position.x = ship.position.x + 10;
    }

    createFixed() {
        // Could also add distance clipping points
        // const camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 100);

        // Move camera back a bit. So it can see scene.
        this.position.z = 200;
        this.isFixedLocation = true;
        this.isFixedRotation = true;
    }

    getIsFixedLocation() {
        return (this.isFixedLocation);
    }

    getIsFixedRotation() {
        return (this.isFixedRotation);
    }

    createStandoff() {
        // Could also add distance clipping points
        // const camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 100);

        // Move camera back a bit. So it can see scene.
        this.position.z = 20;
        this.isFixedLocation = false;
        this.isFixedRotation = true;
    }

    updatePosition(ship) {
        switch (this.type) {
            case MyCamera.STANDOFF:
                // Adjust loation
                let loc = this.ship.location.clone();

                if (null != this.ship.dockedWith) {
                    // If docked ship locarion will be relative to dock.
                    this.ship.dockedWith.localToWorld(loc);
                }

                //this.ship.localToWorld(loc);
                this.position.setX(loc.x - MyCamera.STANDOFF_DIST);
                this.position.setY(loc.y - MyCamera.STANDOFF_DIST);
                this.position.setZ(loc.z - MyCamera.STANDOFF_DIST);

                // Look at the ship
                this.lookAt(loc);
                break;

            case MyCamera.CHASE:
            case MyCamera.PILOT:
                // Nothing to do. Our camera is part of the ship and moves with it.
                break;

            case MyCamera.FIXED:
            // Nothing to do.
            default:
                break;
        }
    }
}

export default MyCamera;
