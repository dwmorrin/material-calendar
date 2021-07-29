import Event from "../../resources/Event";
import Location from "../../resources/Location";
import { ResourceKey } from "../../resources/types";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
  const event = state.resourceInstance as Event;
  return { ...event };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Event => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const event = new Event(state.resourceInstance as Event);
  return {
    ...event,
    location:
      locations.find((l) => l.title === values.location) || new Location(),
  };
};
