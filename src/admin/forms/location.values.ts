import Location from "../../resources/Location";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
  const location = state.resourceInstance as Location;
  return {
    ...location,
  };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Location => {
  const location = new Location(state.resourceInstance as Location);
  return {
    ...location,
    ...values,
  };
};
