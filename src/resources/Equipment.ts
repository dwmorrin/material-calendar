import Category from "./Category";
import Tag from "./Tag";

interface Equipment {
  [k: string]: unknown;
  id: number;
  description: string;
  category: Category; // hierarchial; use sparingly
  tags: Tag[];
  manufacturer: string;
  model: string;
  sku: string;
  serial: string;
  barcode: string;
  notes: string;
  quantity: number; // default=1
  consumable: boolean; // default=false; for admins for periodic reordering
  reservations: {
    bookingId: number;
    quantity: number;
    start: string;
    end: string;
  }[];
  restriction: number;
}

class Equipment implements Equipment {
  static url = "/api/equipment";
  constructor(
    equip = {
      id: 0,
      description: "",
      category: new Category(),
      tags: [] as Tag[],
      quantity: 1,
      consumable: false,
      reservations: [] as {
        bookingId: number;
        quantity: number;
        start: string;
        end: string;
      }[],
    }
  ) {
    Object.assign(this, equip);
    if (typeof this.model === "number") this.model = String(this.model);
  }

  static makeNameHash({ manufacturer, model, description }: Equipment): string {
    return [manufacturer, model, description].filter(String).join(" ");
  }
}

export default Equipment;
