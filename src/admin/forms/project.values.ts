import Project from "../../resources/Project";
import Course from "../../resources/Course";
import { AdminState, FormValues } from "../types";
import { formatSQLDate, parseSQLDate } from "../../utils/date";
import { ResourceKey } from "../../resources/types";

export const values = (state: AdminState): FormValues => {
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const project = state.resourceInstance as Project;
  const locationHours = project.locationHours.map((lh) => ({
    ...lh,
    locationId: String(lh.locationId),
  }));
  return {
    //...project,
    id: project.id,
    title: project.title,
    course: project.course.title,
    sections: courses.reduce(
      (sections, course) => ({
        ...sections,
        [course.id]: {
          ...sections[course.id],
          [course.section]:
            course.id === project.course.id &&
            project.course.sections.includes(course.section),
        },
      }),
      {} as { [k: string]: { [k: string]: boolean } }
    ),
    start: parseSQLDate(project.start),
    end: parseSQLDate(project.end),
    reservationStart: parseSQLDate(project.reservationStart),
    locationHours,
    groupSize: project.groupSize,
    groupAllotedHours: project.groupAllotedHours,
    open: project.open,
  };
};

export const update = (state: AdminState, values: FormValues): Project => {
  const project = new Project(state.resourceInstance as Project);
  const { start, end, reservationStart, course, locationHours } = values;
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
    //! TEMPORARY !!! sections needs to be selected sections
    course: {
      id: selectedCourse.id,
      title: selectedCourse.title,
      sections: [] as string[],
    },
    start: formatSQLDate(start as Date),
    end: formatSQLDate(end as Date),
    reservationStart: formatSQLDate(reservationStart as Date),
    locationHours: (
      locationHours as { locationId: string | string[]; hours: string }[]
    ).map((lh) => ({
      locationId: Array.isArray(lh.locationId)
        ? Number(lh.locationId[0])
        : Number(lh.locationId),
      hours: lh.hours ? Number(lh.hours) : 0,
    })),
  };
};
