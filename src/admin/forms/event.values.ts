import Event from "../../resources/Event";
import Location from "../../resources/Location";
import { ResourceKey } from "../../resources/types";
import { formatSQLDatetime, parseSQLDatetime } from "../../utils/date";
import { AdminState } from "../types";

interface EventValues extends Record<string, unknown> {
  id: number;
  start: Date;
  end: Date;
  location: { title: string };
  title: string;
  reservable: boolean;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const event = state.resourceInstance as Event;
  return {
    id: event.id,
    start: parseSQLDatetime(event.start),
    end: parseSQLDatetime(event.end),
    location: { title: event.location.title },
    title: event.title,
    reservable: event.reservable,
  } as EventValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Event => {
  const { start, end, location, title, reservable } = values as EventValues;
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const selectedLocation = locations.find((l) => l.title === location.title);
  if (!selectedLocation) throw new Error("Location not found");
  const event = new Event(state.resourceInstance as Event);
  return {
    ...event,
    title,
    reservable,
    start: formatSQLDatetime(start),
    end: formatSQLDatetime(end),
    location: selectedLocation,
  };
};
