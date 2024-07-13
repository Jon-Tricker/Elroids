// Cargo bay menu
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

import MenuTable from './menuTable.js';
import BugError from '../../GameErrors/bugError.js';
import { ComponentsMenu } from './componentsMenu.js';

let cargoMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Cargo Menu</P>\
<script src=\"CargoMenu\" ship=\"this.display.game.ship\"></script>\
</BODY>"

class CargoMenu {

    static printMenu(ship) {
        let doc = "";

        doc += "<P>"
        doc += "<P>Total capacity " + ship.getCargoCapacity() + "(t)</P>"
        doc += "<P>Current load " + (ship.getTotalMass() - ship.getMass()) + "(t)</P>"
        doc += "<BR />"

        doc += CargoMenu.displayMinerals(ship);

        doc += "<BR />";

        doc += CargoMenu.displayComponents(ship);

        doc += "</P>"

        return (doc);
    }

    static displayMinerals(ship) {
        let doc = "";
        let minerals = ship.getBays().minerals;

        if (minerals.size == 0) {
            doc += "<P>No minerals.</P>";
        } else {
            let totalValue = 0;

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

            if (null != ship.dockedWith) {
                doc += "<BR />";
                doc += "<P>Sell all minerals <button type=\"button\" onclick=\"CargoMenu.onSellMineralClick(this.display.game.ship)\">" + totalValue + "</button></P>";
            }

        }

        return (doc);

    }

    static displayComponents(ship) {
        let doc = "";
        let tab = new MenuTable();

        let comps = ship.getBays().components;
        if (0 == comps.size) {
            doc += "<P>No components.</P>"
        } else {
            doc += "<P>Components</P>"

            let heads = new Array();
            heads.push("Name");
            heads.push("Mass(t)");
            heads.push("Status(%)");
            heads.push("Details");
            if (null != ship.dockedWith) {
                heads.push("Mount");
                heads.push("Sell");
            }
            tab.addHeadings(heads);

            for (let comp of comps) {
                let vals = new Array();
                vals.push(comp.name);
                vals.push(comp.mass);
                vals.push(comp.status);
                vals.push("<button type=\"button\" onclick=\"CargoMenu.onDetailsClick(this, cursor)\">Show</button>");
                if (null != ship.dockedWith) {
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onMountCompClick(this, cursor)\">Mount</button>");
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onSellCompClick(this, cursor)\">" + comp.getCurrentValue() + "</button>");
                }
                tab.addRow(vals);
            }
            doc += tab.toString();
        }
        return (doc);
    }

    static getButtonText(mineral, mass) {
        let value = mineral.value * mass;
        return ("<button type=\"button\" onclick=\"CargoMenu.onSellMineralClick(this.display.game.ship, cursor, " + mass + ")\">" + value + "</button>");
    }

    static onDetailsClick(menuSystem, cursor) {
        let ship = menuSystem.display.game.ship;
        let comp = CargoMenu.getCompForCursor(ship, cursor);
        ComponentsMenu.displayDetails(menuSystem, comp);
    }

    static getCompForCursor(ship, cursor) {
        let compNumber = 0;

        if (null != ship.dockedWith) {
            if (0 < ship.getBays().minerals.size) {
                // Skip minerals
                compNumber += ship.getBays().minerals.size;

                // Skip sell all
                compNumber++;
            }
        }

        let comps = ship.getBays().components;
        for (let comp of comps) {
            if (compNumber == cursor.y) {
                return (comp);
            } else {
                compNumber++;
            }
        }
        throw (new BugError("No component at cursor."));
    }  
    
    static onMountCompClick(menuSystem, cursor) {
        let ship = menuSystem.display.game.ship;
        let comp = CargoMenu.getCompForCursor(ship, cursor);
        comp.mount(ship, false);
    }

    static onSellCompClick(menuSystem, cursor) {
        let ship = menuSystem.display.game.ship;
        let comp = CargoMenu.getCompForCursor(ship, cursor);
        comp.sell();
    }

    static onSellMineralClick(ship, cursor, mass) {
        let minerals = ship.getBays().minerals;
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