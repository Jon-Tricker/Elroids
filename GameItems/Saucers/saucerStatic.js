// Static saucer.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import Saucer from './saucer.js';

const COLOUR = "#D0FFD0";
const SIZE = 20;
const MASS = 100;

class SaucerStatic extends Saucer {
    shootDue = 0;

    constructor(locationX, locationY, locationZ, game, owner, safe) {
        super(SIZE, locationX, locationY, locationZ, game, MASS, COLOUR, owner, safe);
    }
    
    // Do navigation logic
    navigate() {
    }   
    
    // Do shooting logic
    shoot() {
    } 
    
    getScore() {
        return(10);
    }
}

export default SaucerStatic;