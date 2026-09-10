// Version of a Set which can be converted to JSON. Also a few 'set' utility functions.
// This depends on JavaScript sets being ordered. I believe they always are.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

import BugError from "../bugError.js";

class JSONSet extends Set{

    constructor(arg) {
        super(arg)
    }

    toJSON() {
        let json = [];
        for(let obj of this) {
            json.push(obj.toJSON());
        }

        return(json);
    }

    // Return a random element of the set.
    // This is a bit inefficient but is rarely used and, in general, we would rather have Sets and Sets ... not Arrays.
    getRandomElement() {
        if (0 == this.size){
            return(undefined);
        }

        let index = Math.floor(Math.random() * this.size);

        let i = 0;
        for (let comp of this) {
            if (i == index) {
                return (comp);
            }
            i++;
        }
    }

    // Utility to get an indexed entry
    get(index) {
        let count = 0;

        for (let entry of this) {
            if (count == index) {
                return (entry);
            } else {
                count++;
            }
        }
        throw (new BugError("No element at index."));
    }
    
}

export default JSONSet;