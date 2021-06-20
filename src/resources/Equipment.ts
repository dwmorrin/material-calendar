import Category from "./Category";
import Event from "./Event";
import Tag from "./Tag";
import { parseSQLDatetime } from "../utils/date";

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
  reservations: {
    bookingId: number;
    quantity: number;
    start: string;
    end: string;
  }[];
  restriction: number;
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
            parseSQLDatetime(reservation.start) <=
              parseSQLDatetime(event.start) &&
            parseSQLDatetime(reservation.end) >
              parseSQLDatetime(event.start)) ||
          (parseSQLDatetime(reservation.start) < parseSQLDatetime(event.end) &&
            parseSQLDatetime(reservation.start) >=
              parseSQLDatetime(event.start))
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
