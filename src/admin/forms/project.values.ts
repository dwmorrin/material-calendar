import Project from "../../resources/Project";
import Course from "../../resources/Course";
import { AdminState, FormValues } from "../types";
import { formatSQLDate, parseSQLDate } from "../../utils/date";
import { ResourceKey } from "../../resources/types";

interface ProjectValues extends FormValues {
  id: number;
  title: string;
  course: string;
  sections: { [courseId: string]: { [sectionTitle: string]: boolean } };
  start: Date;
  end: Date;
  reservationStart: Date;
  locationHours: { hours: string; locationId: string }[];
  groupAllottedHours: string;
  groupSize: string;
  open: boolean;
}

export const values = (state: AdminState): FormValues => {
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const project = state.resourceInstance as Project;
  const locationHours = project.locationHours.map(({ hours, locationId }) => ({
    hours: String(hours),
    locationId: String(locationId),
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
    groupSize: String(project.groupSize),
    groupAllottedHours: String(project.groupAllottedHours),
    open: project.open,
  };
};

export const update = (state: AdminState, values: FormValues): Project => {
  const project = new Project(state.resourceInstance as Project);
  const {
    course,
    end,
    locationHours,
    open,
    reservationStart,
    sections: _sections,
    start,
    title,
  } = values as ProjectValues;
  const courseTitle =
    typeof course === "object" ? (course as { title: string }).title : "";
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const selectedCourse = courses.find(({ title }) => title === courseTitle) || {
    title: "",
    id: -1,
  };
  const selectedSections = _sections[selectedCourse.id] || {};
  const sections = Object.entries(selectedSections).reduce(
    (res, [section, selected]) => (selected ? [...res, section] : res),
    [] as string[]
  );

  return {
    // not editable properties
    id: project.id,
    allotments: project.allotments,
    // simple editable properties
    title,
    open,
    // numbers (strings in form)
    groupSize: Number(values.groupSize),
    groupAllottedHours: Number(values.groupAllottedHours),
    // dates (stored as string in database)
    start: formatSQLDate(start as Date),
    end: formatSQLDate(end as Date),
    reservationStart: formatSQLDate(reservationStart as Date),
    // complex editable properties
    course: {
      id: selectedCourse.id,
      title: selectedCourse.title,
      sections,
    },
    locationHours: locationHours.map((lh) => ({
      locationId: Array.isArray(lh.locationId)
        ? Number(lh.locationId[0])
        : Number(lh.locationId),
      hours: lh.hours ? Number(lh.hours) : 0,
    })),
  };
};
