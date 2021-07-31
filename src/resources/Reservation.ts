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
  static rules = {
    refundCutoffHours: Number(
      process.env.REACT_APP_CANCELATION_REFUND_CUTOFF_HOURS || "24"
    ),
    maxWalkInsPerLocation: Number(
      process.env.REACT_APP_MAX_WALK_IN_RESERVATIONS_PER_LOCATION || "0"
    ),
  };
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
