import Semester from "../../resources/Semester";
import { AdminState, FormValues } from "../types";
import { setDefaultDates } from "../../utils/date";
import { deleteKeys } from "../../utils/deleteKeys";

export const values = (state: AdminState): FormValues => {
  const semester = state.resourceInstance as Semester;
  return { ...setDefaultDates(semester, "start", "end") };
};

export const update = (state: AdminState, values: FormValues): Semester => {
  const semester = new Semester(state.resourceInstance as Semester);
  return {
    ...semester,
    ...deleteKeys(values, "__options__"),
  };
};
