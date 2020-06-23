import Event from "../../resources/Event";
import Location from "../../resources/Location";
import { ResourceKey } from "../../resources/types";
import { AdminState, FormValues } from "../types";
import { deleteKeys } from "../../utils/deleteKeys";

export const values = (state: AdminState): FormValues => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const event = state.resourceInstance as Event;
  return {
    ...event,
    location: event.location.title,
    __options__: {
      locations: locations.map((l) => l.title),
    },
  };
};

export const update = (state: AdminState, values: FormValues): Event => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const event = new Event(state.resourceInstance as Event);
  return {
    ...event,
    ...deleteKeys(values, "__options__"),
    location:
      locations.find((l) => l.title === values.location) || new Location(),
  };
};
