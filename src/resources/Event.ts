import { formatSQLDatetime } from "../utils/date";

export interface ReservationInfo {
  id: number;
  projectId: number;
  groupId: number;
  description: string;
  liveRoom: boolean;
  guests: string;
  notes: string;
  contact: string;
  // this and the same in the EquipmentItem should be changed so that it is a dictionary of objects.
  equipment?: {
    [k: string]: {
      quantity: number;
      items?: { id: number; quantity: number }[];
    };
  };
}

interface Event {
  [k: string]: unknown;
  id: number;
  start: string;
  end: string;
  location: { id: number; title: string; restriction: number };
  title: string;
  reservable: boolean;
  reservation?: ReservationInfo;
}

class Event implements Event {
  static url = "/api/events";
  constructor(
    event = {
      id: 0,
      start: formatSQLDatetime(),
      end: formatSQLDatetime(),
      location: { id: 0, title: "" },
      title: "",
      reservable: false,
    }
  ) {
    Object.assign(this, event);
  }
}

export default Event;
