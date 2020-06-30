import RosterRecord from "../../resources/RosterRecord";
import { AdminState, FormValues } from "../types";

export const values = (state: AdminState): FormValues => {
  const rosterRecord = state.resourceInstance as RosterRecord;
  return { ...rosterRecord };
};

export const update = (state: AdminState, values: FormValues): RosterRecord => {
  const rosterRecord = new RosterRecord(state.resourceInstance as RosterRecord);
  return { ...rosterRecord, ...values };
};
