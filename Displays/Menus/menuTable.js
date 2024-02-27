// Class to hold/print menu tables.
//
// For now columns widths are set by widest element.
// For now right justified.
import * as THREE from 'three';

class MenuTable {
    headers;
    rows;
    widths;

    constructor() {
        this.rows = new Array();
        this.widths = new Array();
    }

    addHeadings(heads) {
        this.headers = heads;
        for (let head of heads) {
            this.widths.push(head.length + 2)
        }
    }

    addRow(row) {
        this.rows.push(row);
        for (let i = 0; i < row.length; i ++) {
            if ((row[i].length + 2) > this.widths[i]) {
                this.widths[i] = row[i].length + 2;
            }
        }
    }

    toString() {

        let doc = "<table>";

        // Print headers
        doc += "<tr>";
        for (let i = 0; i < this.headers.length; i++) {
            doc += "<td>";
            doc += this.printElement(this.headers[i], this.widths[i]);
            doc += "</td>"
        }
        doc += "</tr>";  
        
        // Print rows
        doc += "<tr>";
        for (let row of this.rows) {
            for (let i = 0; i < row.length; i++) {
                doc += "<td>";
                doc += this.printElement(row[i], this.widths[i]);
                doc += "</td>"
            }
        }
        doc += "</tr>";

        doc += "</table>";

        return (doc);
    }

    printElement(ele, len) {
        let op = "";
        op += ele;
        while(op.length < len) {
            op += " ";
        }
        return(op);
    }
}

export default MenuTable;