// Version of a Set which can be converted to JSON. 
// Also a few 'set' utility functions.

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

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
        let index = Math.floor(Math.random() * this.size);

        let i = 0;
        for (let comp of this) {
            if (i == index) {
                return (comp);
            }
            i++;
        }
    }
}

export default JSONSet;