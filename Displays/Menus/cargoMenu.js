// Cargo bay menu
//
// Arguments must be in a form that is in scope when eval()ed by MenuSystem.

import MenuTable from './menuTable.js';
import BugError from '../../Game/bugError.js';
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
        doc += "<P>Total capacity " + ship.getCargoCapacity() + "(t), Current load " + ship.hull.compSets.baySet.getContentMass() + "(t)</P>"
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

            let index = 0;
            for (let [mineral, mass] of minerals) {
                let row = new Array();

                row.push(mineral.name);
                row.push(mass);

                if (null != ship.dockedWith) {
                    row.push(CargoMenu.getButtonText(ship.location.system, index, mineral, 1));
                    row.push(CargoMenu.getButtonText(ship.location.system, index, mineral, mass));

                    let value = Math.floor(ship.location.system.spec.getMineralValue(mineral) * mass);
                    totalValue += value;
                } else {
                    row.push(mineral.value * mass);
                    row.push("<button type=\"button\" onclick=\"CargoMenu.onDumpMineralClick(this, " + index + ")\">Dump</button>");
                }

                tab.addRow(row);
                index++;
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

            let index = 0;
            for (let comp of comps) {
                let vals = new Array();
                vals.push(comp.getName());
                vals.push(comp.getMass());
                vals.push(comp.status);
                vals.push("<button type=\"button\" onclick=\"CargoMenu.onDetailsCompClick(this, " + index + ")\">Show</button>");
                if (null != ship.dockedWith) {
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onMountCompClick(this, " + index + ")\">Mount</button>");
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onSellCompClick(this, " + index + ")\">" + comp.getValueInSystem(ship.location.system) + "</button>");
                } else {
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onDumpCompClick(this, " + index + ")\">Dump</button>");
                }
                tab.addRow(vals);
                index++;
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
            if (null == ship.dockedWith) {
                heads.push("Value");
            }
            heads.push("Details");
            heads.push("Legal")
            if (null != ship.dockedWith) {
                heads.push("Base cost")
                heads.push("Sell 1");
                heads.push("Sell all");
            }
            tab.addHeadings(heads);

            let index = 0;
            for (let good of goods) {
                let vals = new Array();
                vals.push(good.getName());
                vals.push(good.getMass());
                vals.push(good.number);
                if (null == ship.dockedWith) {
                    vals.push(good.getValueInSystem(ship.location.system));
                }
                vals.push("<button type=\"button\" onclick=\"CargoMenu.onDetailsGoodsClick(this, " + index + ")\">Show</button>");
                vals.push(good.isLegal(ship.location.system));
                if (null != ship.dockedWith) {
                    vals.push(good.getCost());
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onSellGoodsClick(this, " + index + ", 1)\">" + good.getUnitCostInSystem(ship.location.system) + "</button>");
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onSellGoodsClick(this, " + index + ", " + good.number + ")\">" + good.getValueInSystem(ship.location.system) + "</button>");
                } else {
                    vals.push("<button type=\"button\" onclick=\"CargoMenu.onDumpGoodsClick(this, " + index + ")\">Dump</button>");
                }
                tab.addRow(vals);
                index++;
            }
            doc += tab.toString();
        }
        return (doc);
    }

    static getButtonText(system, index, mineral, mass) {
        let value = Math.floor(system.spec.getMineralValue(mineral) * mass);
        return ("<button type=\"button\" onclick=\"CargoMenu.onSellMineralClick(this, " + index + ", " + mass + ")\">" + value + "</button>");
    }

    static onDetailsCompClick(menuSystem, index) {
        let ship = menuSystem.getShip();
        let comp = CargoMenu.getCompForIndex(ship, index);
        menuSystem.pushScript(ComponentDetailsMenu, comp);
    }

    static onDetailsGoodsClick(menuSystem, index) {
        let ship = menuSystem.getShip();
        let goods = CargoMenu.getGoodsForIndex(ship, index);
        menuSystem.pushScript(GoodsDetailsMenu, goods);
    }

    // Get component or goods for current cursor.
    static getGoodsForIndex(ship, index) {
        let goods = ship.getBays().tradeGoods;
        return (goods.get(index));
    }

    static getCompForIndex(ship, index) {
        let itemNumber = 0;
        let comps = ship.getBays().components;
        return (comps.get(index));
    }


    static onMountCompClick(menuSystem, index) {
        let ship = menuSystem.getShip();
        let comp = CargoMenu.getCompForIndex(ship, index);
        comp.mount(ship, false);
    }

    static onSellCompClick(menuSystem, index) {
        let ship = menuSystem.getShip();
        let comp = CargoMenu.getCompForIndex(ship, index);
        comp.sell();
    }

    static onSellGoodsClick(menuSystem, index, number) {
        let ship = menuSystem.getShip();
        let goods = CargoMenu.getGoodsForIndex(ship, index);
        goods.sell(number);
    }

    static onSellMineralClick(menuSystem, index, mass) {
        let ship = menuSystem.getShip();

        if (undefined === index) {
            // Sell everything
            let minerals = ship.getBays().minerals;
            for (let [key, value] of minerals) {
                ship.sellMineral(key, value);
            }
        } else {
            // Sell selected mineral. 
            let mineral = this.getMineralForIndex(ship, index);
            ship.sellMineral(mineral, mass);
        }
    }

    static getMineralForIndex(ship, index) {
        // This is a map. So can't use JSONSet.get().
        let minerals = ship.getBays().minerals;
        let idx = 0;

        for (let [key, value] of minerals) {
            // Sell selected mineral.
            if (idx == index) {
                return (key);
            }
            idx++;
        }

        // Not found
        throw (new BugError("No mineral at index."));
    }

    static onDumpCompClick(menuSystem, index) {
        let ship = menuSystem.getShip();
        let comp = this.getCompForIndex(ship, index);
        ship.getBays().dumpGoods(comp);
    }

    static onDumpMineralClick(menuSystem, index) {
        let ship = menuSystem.getShip();
        let mineral = this.getMineralForIndex(ship, index);
        ship.getBays().dumpMineral(mineral);
    }

    static onDumpGoodsClick(menuSystem, index) {
        let ship = menuSystem.getShip();
        let goods = this.getGoodsForIndex(ship, index);
        ship.getBays().dumpGoods(goods);
    }
}

export { cargoMenu, CargoMenu }