import RosterRecord from "../../resources/RosterRecord";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
  const rosterRecord = state.resourceInstance as RosterRecord;
  return { ...rosterRecord };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): RosterRecord => {
  const rosterRecord = new RosterRecord(state.resourceInstance as RosterRecord);
  return { ...rosterRecord, ...values };
};
