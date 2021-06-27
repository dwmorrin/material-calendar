import Location from "../../resources/Location";
import { FormValues, AdminState } from "../types";

export const values = (state: AdminState): FormValues => {
  const location = state.resourceInstance as Location;
  return {
    ...location,
  };
};

export const update = (state: AdminState, values: FormValues): Location => {
  const location = new Location(state.resourceInstance as Location);
  return {
    ...location,
    ...values,
  };
};
