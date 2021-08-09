import Category from "./Category";
import Event from "./Event";
import Tag from "./Tag";
import { parseSQLDatetime } from "../utils/date";

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
  // returns the number of an item available during an event
  static getNumberAvailable(item: Equipment, event: Event): number {
    if (item.reservations.length === 0) {
      return item.quantity;
    }
    const eventStartDate = parseSQLDatetime(event.start);
    const eventEndDate = parseSQLDatetime(event.end);
    const reserved = item.reservations
      .filter(({ bookingId, start, end }) => {
        const resStartDate = parseSQLDatetime(start);
        const resEndDate = parseSQLDatetime(end);
        return (
          (event.reservation?.id !== bookingId &&
            resStartDate <= eventStartDate &&
            resEndDate > eventStartDate) ||
          (resStartDate < eventEndDate && resStartDate >= eventStartDate)
        );
      })
      .map((reservation) =>
        // TODO: Remove this and figure out why the filter above is not working.
        reservation.bookingId === event.reservation?.id
          ? 0
          : reservation.quantity
      )
      .reduce((a, b) => a + b, 0);
    return item.quantity - reserved;
  }

  static getAvailableItems(items: Equipment[], event: Event): Equipment[] {
    return items.reduce((available, item) => {
      const numberAvailable = Equipment.getNumberAvailable(item, event);
      if (numberAvailable > 0) {
        available.push({
          ...item,
          quantity: numberAvailable,
        });
      }
      return available;
    }, [] as Equipment[]);
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
