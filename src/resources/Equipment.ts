import Category from "./Category";
import Event from "./Event";
import Tag from "./Tag";
import { unshiftTZ } from "../utils/date";

interface Equipment {
  [k: string]: unknown;
  id: number;
  modelId: number;
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
  reservations: {
    bookingId: number;
    quantity: number;
    start: string;
    end: string;
  }[];
}

class Equipment implements Equipment {
  // returns the number of an item available during an event
  static isAvailable(item: Equipment, event: Event): number {
    if (item.reservations.length === 0) {
      return item.quantity;
    }
    const reserved = item.reservations
      .filter(
        (reservation) =>
          (event.reservation?.id !== reservation.bookingId &&
            unshiftTZ(new Date(reservation.start)) <= new Date(event.start) &&
            unshiftTZ(new Date(reservation.end)) > new Date(event.start)) ||
          (unshiftTZ(new Date(reservation.start)) < new Date(event.end) &&
            unshiftTZ(new Date(reservation.start)) >= new Date(event.start))
      )
      .map((reservation) => {
        // TODO: Remove this and figure out why the filter above is not working.
        if (reservation.bookingId === event.reservation?.id) {
          return 0;
        }
        return reservation.quantity;
      })
      .reduce((a, b) => a + b, 0);
    return item.quantity - reserved;
  }
  static availableItems(items: Equipment[], event: Event): Equipment[] {
    return items
      .map((item) => {
        return { ...item, quantity: Equipment.isAvailable(item, event) };
      })
      .filter((item) => item.quantity > 0);
  }
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
}

export default Equipment;
