import Project, { ProjectLocationHours } from "../../../resources/Project";
import Course from "../../../resources/Course";
import Section from "../../../resources/Section";
import Location from "../../../resources/Location";
import { AdminState } from "../../../admin/types";
import { formatSQLDate, parseSQLDate } from "../../../utils/date";
import { ResourceKey } from "../../../resources/types";

export interface ProjectValues extends Record<string, unknown> {
  id: number;
  title: string;
  course: string;
  sections: { [courseId: string]: { [sectionTitle: string]: boolean } };
  start: Date;
  end: Date;
  reservationStart: Date;
  locations: { [locationId: string]: { selected: boolean; hours: string } };
  groupAllottedHours: string;
  groupSize: string;
  open: boolean;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const project = state.resourceInstance as Project;
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const course = courses.find((c) => c.id === project.course.id);
  const sections = state.resources[ResourceKey.Sections] as Section[];
  const courseSections = sections.reduce((dict, section) => {
    if (!section.title) return dict;
    const course = courses.find((course) => course.id === section.courseId);
    if (!course) return dict;
    if (!dict[course.id]) {
      dict[course.id] = {};
    }
    if (project.course.id === section.courseId) {
      dict[course.id][section.title] = project.course.sections.includes(
        section.title
      );
    } else {
      dict[course.id][section.title] = false;
    }
    return dict;
  }, {} as Record<string, { [sectionTitle: string]: boolean }>);
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const allLocations = locations.reduce(
    (res, { id }) => ({
      ...res,
      [id]: { selected: false, hours: "0" },
    }),
    {}
  );
  const projectLocations = project.locationHours.reduce(
    (res, { hours, locationId }) => ({
      ...res,
      [locationId]: { selected: true, hours: String(hours) },
    }),
    {}
  );

  return {
    id: project.id,
    title: project.title,
    course: course?.title || "",
    sections: courseSections,
    start: parseSQLDate(project.start),
    end: parseSQLDate(project.end),
    reservationStart: parseSQLDate(project.reservationStart),
    locations: { ...allLocations, ...projectLocations },
    groupSize: String(project.groupSize),
    groupAllottedHours: String(project.groupAllottedHours),
    open: project.open,
  } as ProjectValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Project => {
  const project = new Project(state.resourceInstance as Project);
  const {
    course,
    end,
    locations,
    open,
    reservationStart,
    sections: _sections,
    start,
    title,
  } = values as ProjectValues;
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const selectedCourse = courses.find(({ title }) => title === course) || {
    title: "",
    id: -1,
  };
  const selectedSections = _sections[selectedCourse.id] || {};
  const sections = Object.entries(selectedSections).reduce(
    (res, [section, selected]) => (selected ? [...res, section] : res),
    [] as string[]
  );
  const locationHours = Object.entries(locations).reduce(
    (res, [id, { selected, hours }]) => {
      if (selected) {
        res.push({
          locationId: Number(id),
          hours: Number(hours),
        });
      }
      return res;
    },
    [] as ProjectLocationHours[]
  );

  return {
    // not editable properties
    id: project.id,
    allotments: project.allotments,
    totalAllottedHours: project.totalAllottedHours,
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
    locationHours,
  };
};
