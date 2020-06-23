import Location from "../../resources/Location";
import { FormValues, AdminState } from "../types";
import { deleteKeys } from "../../utils/deleteKeys";

export const values = (state: AdminState): FormValues => {
  const location = state.resourceInstance as Location;
  return {
    ...location,
  };
};

export const update = (state: AdminState, values: FormValues): Location => {
  const location = new Location(state.resourceInstance as Location);

  return {
    ...(deleteKeys(location, "selected") as Location),
    ...deleteKeys(values, "__options__"),
  };
};
