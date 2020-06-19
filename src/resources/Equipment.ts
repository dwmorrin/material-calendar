import Category from "./Category";
import Tag from "./Tag";

interface Equipment {
  [k: string]: unknown;
  id: number;
  description: string; //! required
  category: Category; // hierchial; use sparingly
  tags: Tag[];
  manufacturer?: string;
  model?: string;
  sku?: string;
  serial?: string;
  barcode?: string;
  notes?: string; //! string or string[]?
  quantity: number; // default=1
  consumable: boolean; // default=false; for admins for periodic reordering
  reservations: number[];
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
      reservations: [] as number[],
    }
  ) {
    Object.assign(this, equip);
  }
}

export default Equipment;
