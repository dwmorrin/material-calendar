export interface ReservationInfo {
  id: number;
  projectId: number;
  groupId: number;
  description: string;
  liveRoom: boolean;
  guests: string;
  notes: string;
  contact: string;
  equipment?: { [k: string]: number };
}

interface Event {
  [k: string]: unknown;
  id: number;
  start: string;
  end: string;
  location: { id: number; title: string };
  title: string;
  reservable: boolean;
  reservation?: ReservationInfo;
}

class Event implements Event {
  static createQuantity(oldEquipmentList: string): { [k: string]: number } {
    const equipmentList: { [k: string]: number } = {};
    const items = oldEquipmentList.split(",");
    items.forEach(
      (item) =>
        (equipmentList[item.split(";")[0]] = parseInt(item.split(";")[2]))
    );
    return equipmentList;
  }

  static url = "/api/events";
  constructor(
    event = {
      id: 0,
      start: "",
      end: "",
      location: { id: 0, title: "" },
      title: "",
      reservable: false,
    }
  ) {
    Object.assign(this, event);
    //convert old equipment list formats to the new format
    if (typeof this.reservation?.equipment === "string")
      this.reservation.equipment = Event.createQuantity(
        this.reservation.equipment
      );
  }
}

export default Event;
