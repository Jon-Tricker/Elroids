// Class to hold/print menu tables.
//
// For now columns widths are set by widest element.
// For now right justified.
import MenuSystem from '../menuSystem.js';

class MenuTable {
    headers = new Array;    // Can be multipe rows of headers.
    rows;
    widths;

    constructor() {
        this.rows = new Array();
        this.widths = new Array();
    }

    addHeadings(heads) {

        // Work out number of header rows and clo widths.
        let maxRowCount = 0;
        for (let head of heads) {
            let rowCount = 0;
            let maxWidth = 0;
            let width = 0;
            for (let i = 0; i <= head.length; i++) {
                if ((i == head.length) || (head[i] == '\n')) {   
                    // New line
                    rowCount++;
                    if (rowCount > maxRowCount) {
                        maxRowCount = rowCount;
                    }
                    if (width > maxWidth) {
                        maxWidth = width;
                    }
                    width = 0;
                } else {
                    width++;
                }

                if (width > maxWidth) {
                    maxWidth = width;
                }
            }
            this.widths.push(maxWidth + 1);
        }

        for (let i = 0; i < maxRowCount; i++) {
            this.headers.push(new Array);
        }

        for (let head of heads) {
            // Work out length of longest segment of header.
            let segment = "";
            let rowCount = 0;
            for (let i = 0; i <= head.length; i++) {
                if ((i == head.length) || (head[i] == '\n')) {
                    // New line
                    this.headers[rowCount].push(segment);
                    segment = "";
                    rowCount++; 
                } else {
                    segment += head[i];
                }
            }

            // Blank remaining rows.
            for (let row = rowCount; row < this.headers.length; row++) {
                this.headers[row].push("");
            }
        }
    }

    addRow(row) {
        this.rows.push(row);
        for (let i = 0; i < row.length; i++) {
            let length = MenuSystem.getTextLength("<td>" + row[i] + "</td>");
            if ((length + 2) > this.widths[i]) {
                this.widths[i] = length + 2;
            }
        }
    }

    toString() {

        let doc = "<table>";

        // Print headers
        if (undefined != this.headers) {
            for (let row of this.headers) {
                doc += "<tr>";
                for (let i = 0; i < row.length; i++) {
                    doc += "<th>";
                    doc += this.printElement(row[i], this.widths[i]);
                    doc += "</th>"
                }
                doc += "</tr>";
            }
        }

        // Print rows
        for (let row of this.rows) {
            doc += "<tr>";
            for (let i = 0; i < row.length; i++) {
                doc += "<td>";
                doc += this.printElement(row[i]);
                doc += "</td>"
            }
            doc += "</tr>";
        }

        doc += "</table>";

        return (doc);
    }

    printElement(ele, len) {
        let op = "";
        op += ele;

        if (undefined != len) {
            while (op.length < len) {
                op += " ";
            }
        }
        return (op);
    }
}

export default MenuTable;