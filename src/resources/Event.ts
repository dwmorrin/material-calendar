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
      name: string;
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
  location: { id: number; title: string };
  title: string;
  reservable: boolean;
  reservation?: ReservationInfo;
}

class Event implements Event {
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
  }
}

export default Event;
