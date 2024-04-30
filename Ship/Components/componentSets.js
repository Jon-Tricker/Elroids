// A group of component sets, for example, a shopping catalogue.
//
// Need random access and fixed order so not a JS 'set'
class ComponentSets extends Array {

    constructor() {
        super();
    }

    add(compSet) {
        super.push(compSet);
    } 
    
    delete(compSet) {
        for (i = 0; i < this.length; i++) {
            if (this[i] == compSet) {
                this.splice(i, 1);
                break;
            }
        }
    }

    takeDamage(hits) {
        while((hits > 0) && (this.getCurrentHp() > 0)) {
            // Damage a random set.
            let index = Math.floor(Math.random() * this.length);
            hits -= this[index].takeDamage(1);
        }
    }

    getCurrentHp() {
        let hp = 0;       
        for (let set of this) {
            hp += set.getCurrentHp();
        }
        return(hp);
    }

}

export default ComponentSets;