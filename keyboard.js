/*
Since held keys will click at an unknown rate (and it take a while for them to start) need to do some
handling ourself.
*/
class Keyboard {
    // Set of down keys .. we hope this will ba small set.
    static keyState = new Set();

    static keyDown(event) {
        if (!this.keyState.has(event.key)) {
            this.keyState.add(event.key);
        }
    }

    static keyUp(event) {
        if (this.keyState.has(event.key)) {
            // console.log("down" + event.key)
            this.keyState.delete(event.key);
        }
    }

    // For held down keys. Get state ... do not clear it. 
    static getState(name) {
        return (this.keyState.has(name));
    }
    
    // For held instantaneous keys. Get state and clear it. 
    static getClearState(name) {
        let pressed = this.keyState.has(name);
            this.keyState.delete(name);

        return (pressed);
    }

    static dumpState () {
        let string = "";
        for (let item of this.keyState) {
            string += item;
        }
        console.log("up" + event.key + " " + string);
    }
}

export default Keyboard;
