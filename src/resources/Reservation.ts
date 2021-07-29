interface ActionDetails {
  on: string;
  by: string;
  comment?: string;
}

interface Reservation {
  [k: string]: unknown;
  id: number;
  description: string;
  eventId: number;
  projectId: number;
  groupId: number;
  guests: string;
  cancellation?: {
    canceled: ActionDetails;
    refund?: {
      approvedId: ActionDetails;
      deniedId: ActionDetails;
    };
  } | null;
}

class Reservation implements Reservation {
  static url = "/api/reservations";
  constructor(
    res = {
      id: 0,
      description: "",
      eventId: 0,
      projectId: 0,
      groupId: 0,
      guests: "",
    }
  ) {
    Object.assign(this, res);
  }
}

export default Reservation;
