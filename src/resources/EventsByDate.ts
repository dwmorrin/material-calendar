import Event from "./Event";
import { castSQLDatetimeToSQLDate, sqlDateRange } from "../utils/date";

const sortByStart = (a: Event, b: Event): number =>
  a.start > b.start ? 1 : a.start < b.start ? -1 : 0;

export const combineSameLocationEvents = (events: Event[]): Event[] => {
  events.sort(sortByStart);
  const result: Event[] = [];
  let i = 0;
  while (i < events.length) {
    const initialEvent = new Event(events[i]);
    result.push(initialEvent);
    if (initialEvent.reservation) {
      // check for additional events that should be combined into one event
      let cursor = new Event(initialEvent);
      while (
        i < events.length &&
        events[i + 1] &&
        events[i + 1].reservation &&
        events[i + 1].reservation?.groupId === cursor.reservation?.groupId
      ) {
        const nextEvent = new Event(events[++i]);
        cursor.next = nextEvent;
        initialEvent.end = nextEvent.end;
        if (
          initialEvent.reservation?.equipment &&
          nextEvent.reservation?.equipment
        )
          Object.assign(
            initialEvent.reservation.equipment,
            nextEvent.reservation.equipment
          );
        else if (
          !initialEvent.reservation.equipment &&
          nextEvent.reservation?.equipment
        )
          initialEvent.reservation.equipment = nextEvent.reservation.equipment;
        cursor = new Event(nextEvent);
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

export const removeEvent = (
  events: EventsByDate,
  event: Event
): EventsByDate => {
  const date = event.start.split(" ")[0];
  if (date in events && events[date][event.location.id]) {
    events[date][event.location.id] = [
      ...events[date][event.location.id].filter(({ id }) => id !== event.id),
    ];
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
  const dateRange = sqlDateRange(
    castSQLDatetimeToSQLDate(start),
    castSQLDatetimeToSQLDate(end)
  );
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
