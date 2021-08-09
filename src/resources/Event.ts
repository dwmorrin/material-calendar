import {
  formatSQLDatetime,
  isSameDay,
  isValidDateInterval,
  isWithinInterval,
  nowInServerTimezone,
  parseSQLDatetime,
  subMinutes,
  todayInServerTimezoneAtHour,
} from "../utils/date";

export interface ReservationInfo {
  id: number;
  projectId: number;
  groupId: number;
  description: string;
  liveRoom: boolean;
  guests: string;
  notes: string;
  contact: string;
  created: string;
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
  location: {
    id: number;
    groupId: string;
    title: string;
    restriction: number;
    allowsWalkIns: boolean;
  };
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
      location: { id: 0, title: "", restriction: 0, allowsWalkIns: false },
      title: "",
      reservable: false,
    }
  ) {
    Object.assign(this, event);
  }

  // 2nd argument should be memoized for best performance if iterating
  static isAvailableForWalkIn(
    event: Event,
    { now, start, end, cutoffMinutes } = Event.walkInDetails()
  ): boolean {
    if (!event.reservable || !event.location.allowsWalkIns) return false;
    const sameDay = isSameDay(now, parseSQLDatetime(event.start));
    const withinWalkInPeriod = isWithinInterval(now, {
      start,
      end,
    });
    const bookingCutoffHasNotPassed = isValidDateInterval({
      start: now,
      end: subMinutes(parseSQLDatetime(event.end), cutoffMinutes),
    });
    return sameDay && withinWalkInPeriod && bookingCutoffHasNotPassed;
  }

  // this is expensive and must be memoized before iterating
  static walkInDetails(): {
    now: Date;
    start: Date;
    end: Date;
    cutoffMinutes: number;
  } {
    return {
      now: nowInServerTimezone(),
      start: todayInServerTimezoneAtHour(
        Number(process.env.REACT_APP_WALK_IN_START_HOUR)
      ),
      end: todayInServerTimezoneAtHour(
        Number(process.env.REACT_APP_WALK_IN_END_HOUR)
      ),
      cutoffMinutes: Number(
        process.env.REACT_APP_EVENT_IN_PROGRESS_CUTOFF_MINUTES
      ),
    };
  }
}

export default Event;
