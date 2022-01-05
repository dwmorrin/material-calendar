import Equipment from "../../../resources/Equipment";

const template = (equip: unknown): string[][] =>
  equip instanceof Equipment
    ? [
        ["ID", equip.id.toString()],
        ["Description", equip.description],
        ["Manufacturer", equip.manufacturer || "none"],
        ["Model", equip.model || "none"],
        ["SKU", equip.sku || "none"],
        // ["Serial #", equip.serial || "none"],
        // ["Barcode", equip.barcode || "none"],
        // ["Notes", equip.notes || "none"],
        ["Quantity", equip.quantity.toString()],
        // ["Reservations", equip.reservations.length ? "Yes" : "No"],
      ]
    : [["", JSON.stringify(equip)]];

export default template;
