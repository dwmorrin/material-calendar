import Project from "../../resources/Project";
import Course from "../../resources/Course";
import { AdminState, FormValues } from "../types";
import { formatSQLDate, parseSQLDate } from "../../utils/date";
import { ResourceKey } from "../../resources/types";

export const values = (state: AdminState): FormValues => {
  const project = state.resourceInstance as Project;
  return {
    ...project,
    start: parseSQLDate(project.start),
    end: parseSQLDate(project.end),
    reservationStart: parseSQLDate(project.reservationStart),
    locationIds: project.locationIds.map(String),
  };
};

export const update = (state: AdminState, values: FormValues): Project => {
  const project = new Project(state.resourceInstance as Project);
  const locationIds = (values.locationIds as string[]).map(Number);
  const { start, end, reservationStart, course } = values;
  const courseTitle =
    typeof course === "object" ? (course as { title: string }).title : "";
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const selectedCourse = courses.find(({ title }) => title === courseTitle) || {
    title: "",
    id: -1,
  };

  return {
    ...project,
    ...values,
    course: { id: selectedCourse.id, title: selectedCourse.title },
    start: formatSQLDate(start as Date),
    end: formatSQLDate(end as Date),
    reservationStart: formatSQLDate(reservationStart as Date),
    locationIds,
  };
};
