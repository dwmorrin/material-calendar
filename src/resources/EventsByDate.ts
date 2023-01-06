import Event from "./Event";
import { sqlDateRange } from "../utils/date";

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
          selectedEvents.push(...events[date][locationId]);
    }
  }
  return selectedEvents;
};

export default EventsByDate;
