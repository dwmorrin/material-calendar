import Event from "../../resources/Event";
import Location from "../../resources/Location";
import { ResourceKey } from "../../resources/types";
import { AdminState, FormValues } from "../types";
import { deleteKeys } from "../../utils/deleteKeys";

export const values = (state: AdminState): FormValues => {
  const event = state.resourceInstance as Event;
  return {
    ...event,
    locations: state.resources[ResourceKey.Locations].map(
      (l) => (l as Location).title
    ),
  };
};

export const update = (state: AdminState, values: FormValues): Event => {
  const event = new Event(state.resourceInstance as Event);
  return { ...event, ...deleteKeys(values, "locations") };
};
