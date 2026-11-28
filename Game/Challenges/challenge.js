// Defines the conditions of a 'challenge' game.

// Copyright (C) Jon Tricker 2026.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

class Challenge {

    name;           // Challenge name.

    // Starting conditions
    system;        // Staring start system
    damage;        // Starting ship damage (%)
    docked;        // Start docked?
    reputation;    // Starting rep.

    getName() {
        return (this.name)
    }

    getSystem() {
        return (this.system)
    }

    getDamage() {
        return (this.damage);
    }

    getDocked() {
        return (this.docked);
    } 
    
    getReputation() {
        return (this.reputation);
    }

    // Configure game to match challenge.
    setupGame(game) {
        game.startDocked = this.getDocked();
        game.startSystem = this.getSystem();
        game.preDamage = this.getDamage();
        game.player.reputation = this.getReputation();
    }

    // Check if challenge completed.
    // Normally part of animate loop.
    isComplete() {
        return (false);
    }
}

export default Challenge;