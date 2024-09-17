// Version of a Set which can be converted tgo JSON. 

// Copyright (C) Jon Tricker 2023.
// Released under the terms of the GNU Public licence (GPL)
//      https://www.gnu.org/licenses/gpl-3.0.en.html

class JSONSet extends Set{

    constructor() {
        super()
    }

    toJSON() {
        let json = [];
        for(let obj of this) {
            json.push(obj.toJSON());
        }

        return(json);
    }

    /*
    static fromJSON(json) {
        for (let obj in json) {
            console.log(obj);
        }
    }
    */
}

export default JSONSet;