import Semester from "../../resources/Semester";
import { AdminState, FormValues } from "../types";
import { formatSQLDate, parseSQLDate } from "../../utils/date";
import { deleteKeys } from "../../utils/deleteKeys";

export const values = (state: AdminState): FormValues => {
  const semester = state.resourceInstance as Semester;
  return {
    ...semester,
    start: parseSQLDate(semester.start),
    end: parseSQLDate(semester.end),
  };
};

export const update = (state: AdminState, values: FormValues): Semester => {
  const semester = new Semester(state.resourceInstance as Semester);
  return {
    ...semester,
    ...deleteKeys(values, "__options__"),
    start: formatSQLDate(values.start as Date),
    end: formatSQLDate(values.end as Date),
  };
};
