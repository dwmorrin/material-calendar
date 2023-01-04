import Equipment from "./Equipment";
import { formatSQLDatetime } from "../utils/date";

interface ActionDetails {
  on: string;
  by: number | null;
  comment?: string;
}

export interface ReservationCancelation {
  canceled: ActionDetails & { requestsRefund: boolean };
  refund: {
    approved: ActionDetails;
    rejected: ActionDetails; // TODO: add comment in database for this
  };
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
  cancelation: ReservationCancelation | null;
  equipment: Equipment[];
  checkIn: string | null;
  checkOut: string | null;
}

class Reservation implements Reservation {
  static url = "/api/reservations";
  static exceptionUrl = {
    refund(res: Reservation): string {
      return `${Reservation.url}/admin/exceptions/refund/${res.id}`;
    },
  };
  static forwardUrl = `${Reservation.url}/forward`;
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
  static hasPendingRefundRequest({ cancelation }: Reservation): boolean {
    if (!cancelation) return false;
    const {
      canceled,
      refund: { approved, rejected },
    } = cancelation;
    const unanswered = !approved.by && !rejected.by;
    return canceled.requestsRefund && unanswered;
  }
  static isNotRefunded(res: Reservation): boolean {
    return !res.cancelation?.refund?.approved?.by;
  }
  static isRefunded(res: Reservation): boolean {
    return !Reservation.isNotRefunded(res);
  }
  constructor(
    res = {
      id: 0,
      description: "",
      eventId: 0,
      projectId: 0,
      groupId: 0,
      guests: "",
      created: formatSQLDatetime(),
      cancelation: null as ReservationCancelation | null,
      equipment: [] as Equipment[],
      checkIn: null as string | null,
      checkOut: null as string | null,
    }
  ) {
    Object.assign(this, res);
  }
}

export default Reservation;
