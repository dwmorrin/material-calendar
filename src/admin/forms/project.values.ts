import Project from "../../resources/Project";
import Course from "../../resources/Course";
import { ResourceKey } from "../../resources/types";
import { AdminState, FormValues, ValueDictionary } from "../types";
import { deleteKeys } from "../../utils/deleteKeys";

//! BUG cannot apply boolean to forms, needs to be strings
// gets choices of group from state, marks which is selected
type Choices = { [k: string]: boolean };
const getTitlesSelected = (project: Project, state: AdminState): Choices =>
  (state.resources[ResourceKey.Courses] as Course[]).reduce(
    (dict: ValueDictionary, course): ValueDictionary =>
      !dict
        ? {}
        : !course.title
        ? dict
        : {
            ...dict,
            [course.title as string]: project.course.title === course.title,
          },
    {}
  );

// assumes only one item is marked TRUE
const getChoice = (choices: Choices): string =>
  Object.keys(choices).filter((key) => choices[key])[0];

// recover a group from a group title
const getGroup = (title: string, state: AdminState): Course => {
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const found = courses.find((course) => (course as Course).title === title);
  return deleteKeys(found as Course, "projects") as Course;
};

const makeDefaultDateString = (): string => new Date().toJSON().split("T")[0];

// default project dates are set to empty string, this sets them to now
const setDefaultDates = (project: Project): Project => {
  const copy = { ...project };
  const defaultDate = makeDefaultDateString();
  ["start", "end", "reservationStart"].forEach((key) => {
    if (!copy[key]) copy[key] = defaultDate;
  });
  return copy;
};

export const values = (state: AdminState): FormValues => {
  const project = state.resourceInstance as Project;

  return {
    ...setDefaultDates(project),
    __options__: { courses: getTitlesSelected(project, state) },
  };
};

export const update = (state: AdminState, values: FormValues): Project => {
  const project = new Project(state.resourceInstance as Project);

  return {
    ...project,
    ...deleteKeys(values, "__options__"),
    course: getGroup(getChoice(values.groups as Choices), state),
  };
};
