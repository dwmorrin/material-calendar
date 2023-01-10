import Event from "./Event";
import { sqlDateRange } from "../utils/date";

const sortByStart = (a: Event, b: Event): number =>
  a.start > b.start ? 1 : a.start < b.start ? -1 : 0;

export const combineSameLocationEvents = (events: Event[]): Event[] => {
  events.sort(sortByStart);
  const result: Event[] = [];
  let i = 0;
  while (i < events.length) {
    const e = new Event(events[i]);
    result.push(e);
    if (e.reservation) {
      while (i < events.length && events[i + 1] && events[i + 1].reservation) {
        ++i;
        const nextEvent = new Event(events[i]);
        if (nextEvent.reservation?.groupId === e.reservation.groupId) {
          e.end = nextEvent.end;
          if (e.reservation.equipment && nextEvent.reservation?.equipment)
            Object.assign(
              e.reservation.equipment,
              nextEvent.reservation.equipment
            );
          else if (!e.reservation.equipment && nextEvent.reservation?.equipment)
            e.reservation.equipment = nextEvent.reservation.equipment;
        }
      }
    }
    ++i;
  }
  return result;
};

export const addEvents = (
  events: EventsByDate,
  eventArray: Event[]
): EventsByDate => {
  for (const event of eventArray) {
    const date = event.start.split(" ")[0];
    if (!(date in events)) events[date] = {};
    if (!(event.location.id in events[date]))
      events[date][event.location.id] = [];
    const existingIndex = events[date][event.location.id].findIndex(
      (e) => e.id === event.id
    );
    if (existingIndex === -1) events[date][event.location.id].push(event);
    else events[date][event.location.id][existingIndex] = event;
  }
  return events;
};

class EventsByDate {
  [date: string]: { [locationId: number]: Event[] };

  constructor(events: Event[]) {
    addEvents(this, events);
  }
}

export const getRange = (
  events: EventsByDate,
  locationIds: number[],
  start: string,
  end: string
): Event[] => {
  const dateRange = sqlDateRange(start, end);
  const selectedEvents: Event[] = [];
  for (const date of dateRange) {
    if (date in events) {
      for (const locationId of locationIds)
        if (locationId in events[date])
          selectedEvents.push(
            ...combineSameLocationEvents(events[date][locationId])
          );
    }
  }
  return selectedEvents;
};

export default EventsByDate;
