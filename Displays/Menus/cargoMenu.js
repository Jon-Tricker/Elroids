// Cargo bay menu
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

import MenuTable from './menuTable.js';

let cargoMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Cargo Menu</P>\
<script src=\"CargoMenu\" ship=\"this.display.game.ship\"></script>\
</BODY>"

class CargoMenu {

    static printMenu(ship) {
        let minerals = ship.getMinerals();
        let doc = "";

        doc += "<P>"

        doc += "<P>Total capacity " + ship.getCargoCapacity() + "(t)</P>"
        doc += "<P>Current load " + (ship.getTotalMass() - ship.getMass()) + "(t)</P>"
        doc += "<BR />"

        if (minerals.size == 0) {
            doc += "<P>No minerals.</P>"
        } else {
            doc += "<P>Minerals</P>"

            let tab = new MenuTable();

            let heads = new Array();
            heads.push("Type");
            heads.push("Mass(t)");

            if (null != ship.dockedWith) {
                heads.push("Sell 1(t)");
                heads.push("Sell all");
            } else {
                heads.push("Value(cr)");
            }

            tab.addHeadings(heads);

            let totalValue = 0;
            for (let [mineral, mass] of minerals) {
                let row = new Array();

                row.push(mineral.name);
                row.push(mass);

                if (null != ship.dockedWith) {
                    row.push(CargoMenu.getButtonText(mineral, 1));
                    row.push(CargoMenu.getButtonText(mineral, mass));

                    totalValue += mineral.value * mass;
                } else {
                    row.push(mineral.value * mass);
                }

                tab.addRow(row);
            }
            doc += tab.toString();
            doc += "<P></P>";

            if (null != ship.dockedWith) {
                doc += "Sell all <button type=\"button\" onclick=\"CargoMenu.onSellClick(this.display.game.ship)\">" + totalValue + "</button>";
                doc += "<BR />";
            }
        }

        doc += "</P>"

        return (doc);

    }

    static getButtonText(mineral, mass) {
        let value = mineral.value * mass;
        return ("<button type=\"button\" onclick=\"CargoMenu.onSellClick(this.display.game.ship, cursor, " + mass + ")\">" + value + "</button>");
    }

    static onSellClick(ship, cursor, mass) {
        let minerals = ship.getMinerals();
        let index = 0;
        for (let [key, value] of minerals) {
            if (undefined === cursor) {
                // Sell everything
                ship.sellMineral(key, value);
            } else {
                // Sell selected mineral.
                if (index == cursor.y) {
                    ship.sellMineral(key, mass);
                    break;
                }
            }
            index++;
        }
    }
}

export { cargoMenu, CargoMenu }