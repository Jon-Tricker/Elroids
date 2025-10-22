// Cargo bay menu
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

import MenuTable from './menuTable.js';
import BugError from '../../GameErrors/bugError.js';
import { GoodsDetailsMenu } from './goodsPurchaseMenu.js'
import { ComponentDetailsMenu } from './compPurchaseMenu.js';
import { Component } from '../../Ships/Components/component.js';

let cargoMenu = "\
<BODY>\
<P ALIGN=\"CENTER\" HIGHLIGHT=\"true\">Cargo Menu</P>\
<script src=\"CargoMenu\" ship=\"this.getShip()\"></script>\
</BODY>"

class CargoMenu {

    static printMenu(ship) {
        let doc = "";

        doc += "<P>"
        doc += "<P>Total capacity " + ship.getCargoCapacity() + "(t)</P>"
        doc += "<P>Current load " + ship.hull.compSets.baySet.getContentMass() + "(t)</P>"
        doc += "<BR />"

        doc += CargoMenu.displayMinerals(ship);

        doc += "<BR />";

        doc += CargoMenu.displayComponents(ship);

        doc += "<BR />";

        doc += CargoMenu.displayGoods(ship);

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
                    row.push(CargoMenu.getButtonText(ship.system, mineral, 1));
                    row.push(CargoMenu.getButtonText(ship.system, mineral, mass));

                    let value = Math.floor(ship.system.spec.getMineralValue(mineral) * mass);
                    totalValue += value;
                } else {
                    row.push(mineral.value * mass);
                    row.push("<button type=\"button\" onclick=\"CargoMenu.onDumpMineralClick(this, cursor)\">Dump</button>");
                }

                tab.addRow(row);
            }
            doc += tab.toString();

            if (null != ship.dockedWith) {
                doc += "<BR />";
                doc += "<P>Sell all minerals <button type=\"button\" onclick=\"CargoMenu.onSellMineralClick(this)\">" + totalValue + "</button></P>";
            }

        }

        return (doc);

    }

    static displayComponents(ship) {
        let doc = "";
        let tab = new MenuTable();

        let comps = ship.getBays().components;
        doc += "<P>";
        if (0 == comps.size) {
            doc += "No "
        }
        doc += comps.plural + "</P>"

        if (0 != comps.size) {
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
                vals.push(comp.getName());
                vals.push(comp.getMass());
                vals.push(comp.status);
                vals.push("<button type=\"button\" onclick=\"CargoMenu.onDetailsClick(this, cursor)\">Show</button>");
                if (null != ship.dockedWith) {
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onMountCompClick(this, cursor)\">Mount</button>");
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onSellCompClick(this, cursor)\">" + comp.getValueInSystem(ship.system) + "</button>");
                } else {
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onDumpGoodsClick(this, cursor)\">Dump</button>");
                }
                tab.addRow(vals);
            }
            doc += tab.toString();
        }
        return (doc);
    }

    static displayGoods(ship) {
        let doc = "";
        let tab = new MenuTable();

        let goods = ship.getBays().tradeGoods;
        doc += "<P>";
        if (0 == goods.size) {
            doc += "No "
        }
        doc += goods.plural + "</P>"

        if (0 != goods.size) {
            let heads = new Array();
            heads.push("Name");
            heads.push("Mass(t)");
            heads.push("Number");
            heads.push("Details");
            heads.push("Legal")
            if (null != ship.dockedWith) {
                heads.push("Base cost")
                heads.push("Sell 1");
                heads.push("Sell all");
            }
            tab.addHeadings(heads);

            for (let good of goods) {
                let vals = new Array();
                vals.push(good.getName());
                vals.push(good.getMass());
                vals.push(good.number);
                vals.push("<button type=\"button\" onclick=\"CargoMenu.onDetailsClick(this, cursor)\">Show</button>");
                vals.push(good.isLegal(ship.system));
                if (null != ship.dockedWith) {
                    vals.push(good.getCost());
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onSellGoodsClick(this, cursor, 1)\">" + good.getUnitCostInSystem(ship.system) + "</button>");
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onSellGoodsClick(this, cursor, " + good.number + ")\">" + good.getValueInSystem(ship.system) + "</button>");
                } else {
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onDumpGoodsClick(this, cursor)\">Dump</button>");
                }
                tab.addRow(vals);
            }
            doc += tab.toString();
        }
        return (doc);
    }

    static getButtonText(system, mineral, mass) {
        let value = Math.floor(system.spec.getMineralValue(mineral) * mass);
        return ("<button type=\"button\" onclick=\"CargoMenu.onSellMineralClick(this, cursor, " + mass + ")\">" + value + "</button>");
    }

    static onDetailsClick(menuSystem, cursor) {
        let ship = menuSystem.getShip();
        let comp = CargoMenu.getGoodsForCursor(ship, cursor);
        if (comp instanceof Component) {
            menuSystem.pushScript(ComponentDetailsMenu, comp);
        } else {
            menuSystem.pushScript(GoodsDetailsMenu, comp);
        }
    }

    // Get component or goods for current cursor.
    static getGoodsForCursor(ship, cursor) {
        let itemNumber = 0;

        // Skip minerals
        if (0 < ship.getBays().minerals.size) {
            itemNumber += ship.getBays().minerals.size;

            if (null != ship.dockedWith) {
                // Skip sell all
                itemNumber++;
            }
        }

        // Look for component
        let comps = ship.getBays().components;
        for (let comp of comps) {
            if (itemNumber == cursor.y) {
                return (comp);
            } else {
                itemNumber++;
            }
        }

        let goods = ship.getBays().tradeGoods;
        for (let good of goods) {
            if (itemNumber == cursor.y) {
                return (good);
            } else {
                itemNumber++;
            }
        }
        throw (new BugError("No components/goods at cursor."));
    }

    static onMountCompClick(menuSystem, cursor) {
        let ship = menuSystem.getShip();
        let comp = CargoMenu.getGoodsForCursor(ship, cursor);
        comp.mount(ship, false);
    }

    static onSellCompClick(menuSystem, cursor) {
        let ship = menuSystem.getShip();
        let comp = CargoMenu.getGoodsForCursor(ship, cursor);
        comp.sell();
    }

    static onSellGoodsClick(menuSystem, cursor, number) {
        let ship = menuSystem.getShip();
        let goods = CargoMenu.getGoodsForCursor(ship, cursor);
        goods.sell(number);
    }

    static onSellMineralClick(menuSystem, cursor, mass) {
        let ship = menuSystem.getShip();

        if (undefined === cursor) {
            // Sell everything
            let minerals = ship.getBays().minerals;
            for (let [key, value] of minerals) {
                ship.sellMineral(key, value);
            }
        } else {
            // Sell selected mineral.
            let mineral = this.getMineralForCursor(ship, cursor);
            ship.sellMineral(mineral, mass);
        }
    }

    static getMineralForCursor(ship, cursor) {
        let minerals = ship.getBays().minerals;
        let index = 0;
        for (let [key, value] of minerals) {
            // Sell selected mineral.
            if (index == cursor.y) {
                return (key);
            }
            index++;
        }

        // Not found
        throw (new BugError("No mineral at cursor."));
    }

    static onDumpMineralClick(menuSystem, cursor) {
        let ship = menuSystem.getShip();
        let mineral = this.getMineralForCursor(ship, cursor);
        ship.getBays().dumpMineral(mineral);
    }

    static onDumpGoodsClick(menuSystem, cursor) {
        let ship = menuSystem.getShip();
        let goods = CargoMenu.getGoodsForCursor(ship, cursor);
        ship.getBays().dumpGoods(goods);
    }
}

export { cargoMenu, CargoMenu }