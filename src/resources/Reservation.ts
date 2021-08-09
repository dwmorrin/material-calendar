import Equipment from "./Equipment";

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
  created: string;
  cancellation?: {
    canceled: ActionDetails;
    refund?: {
      approvedId: ActionDetails;
      deniedId: ActionDetails;
    };
  } | null;
  equipment: Equipment[];
}

class Reservation implements Reservation {
  static url = "/api/reservations";
  static rules = {
    inProgressCutoffMinutes: Number(
      process.env.REACT_APP_EVENT_IN_PROGRESS_CUTOFF_MINUTES || "30"
    ),
    refundCutoffHours: Number(
      process.env.REACT_APP_CANCELATION_REFUND_CUTOFF_HOURS || "24"
    ),
    maxWalkInsPerLocation: Number(
      process.env.REACT_APP_WALK_IN_RESERVATIONS_PER_LOCATION || "0"
    ),
    refundGracePeriodMinutes: Number(
      process.env.REACT_APP_CANCELATION_REFUND_GRACE_PERIOD_MINUTES || "15"
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
      equipment: [] as Equipment[],
    }
  ) {
    Object.assign(this, res);
  }
}

export default Reservation;
