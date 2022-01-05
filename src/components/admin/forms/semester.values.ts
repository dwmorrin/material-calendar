import Semester from "../../../resources/Semester";
import { AdminState } from "../types";
import { formatSQLDate, parseSQLDate } from "../../../utils/date";

interface SemesterValues extends Record<string, unknown> {
  id: number;
  title: string;
  start: Date;
  end: Date;
  active: boolean;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const semester = state.resourceInstance as Semester;
  return {
    ...semester,
    start: parseSQLDate(semester.start),
    end: parseSQLDate(semester.end),
  };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Semester => {
  const semester = new Semester(state.resourceInstance as Semester);
  const { start, end, title, active } = values as SemesterValues;
  return {
    ...semester,
    title,
    start: formatSQLDate(start),
    end: formatSQLDate(end),
    active,
  };
};
