export interface ReservationInfo {
  id: number;
  groupId: number;
  equipment?: string;
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
