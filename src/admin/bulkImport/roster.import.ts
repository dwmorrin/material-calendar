import Course from "../../resources/Course";
import { AdminAction, AdminState } from "../types";
import User from "../../resources/User";
import Project, { defaultProject } from "../../resources/Project";
import { ResourceKey } from "../../resources/types";
import RosterRecord from "../../resources/RosterRecord";

export const headings = [
  "Course",
  "Catalog",
  "Section",
  "Instructor",
  "Student",
  "NetID",
  "Restriction",
  "Project",
];

// TODO use headings below to parse submission correctly

const defaultUserInfo = {
  id: 0,
  roles: [],
  email: "",
  phone: "",
  projects: [],
};

const bulkImport = (
  dispatch: (action: {
    type: AdminAction;
    payload: Record<string, unknown>;
  }) => void,
  records: unknown,
  state: AdminState
): void => {
  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });
  if (!Array.isArray(records))
    return dispatchError(
      new Error(
        "Roster import failed: could not parse roster (records not an array)"
      )
    );
  // get courses
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const newCourses = records.reduce((dict, r) => {
    if (courses.find(({ title }) => r.Course === title)) return dict;
    const key = r.Course + r.Section;
    if (!dict[key])
      dict[key] = new Course({
        id: -1,
        title: r.Course,
        catalogId: r.Catalog,
        section: r.Section,
        instructor: r.Instructor,
      });
    return dict;
  }, {});
  const mergedCoures = [...courses, ...Object.values(newCourses)] as Project[];
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const semester = state.selectedSemester;
  if (!semester)
    return dispatchError(
      new Error("Roster import failed: no semester selected.")
    );
  const newProjects = records.reduce((dict, r) => {
    if (projects.find(({ title }) => title === r.Project)) return dict;
    const key = r.Project;
    if (!dict[key]) {
      const course =
        mergedCoures.find(({ title }) => title === r.Course) ||
        new Course({
          id: -1,
          title: r.Course,
          catalogId: r.Catalog,
          section: r.Section,
          instructor: r.Instructor,
        });
      dict[key] = new Project({
        ...defaultProject,
        title: key,
        course,
        start: semester.start,
        end: semester.end,
        reservationStart: semester.start,
      });
    }
    return dict;
  }, {});

  const users = state.resources[ResourceKey.Users] as User[];
  const [newUsers, modifiedUsers] = records.reduce(
    ([newUsers, modifiedUsers], r) => {
      const [last = "", first = ""] = r.Student.split(/\s*,\s*/);
      const existing = users.find(({ username }) => username === r.NetID);
      if (existing) {
        if (last === existing.name?.last && first === existing.name?.first) {
          // nothing to do
          return [newUsers, modifiedUsers];
        } else {
          // add to modified users
          return [
            newUsers,
            {
              ...modifiedUsers,
              [r.NetID]: new User({
                ...existing,
                name: { first, last, middle: "" },
                restriction: Number(r.Restriction) || 0,
              }),
            },
          ];
        }
      }
      if (r.NetId in newUsers) return [newUsers, modifiedUsers];
      // add to new users
      return [
        {
          ...newUsers,
          [r.NetID]: new User({
            ...defaultUserInfo,
            username: r.NetID,
            name: { first, last, middle: "" },
            restriction: Number(r.Restriction) || 0,
          }),
        },
        modifiedUsers,
      ];
    },
    [{}, {}]
  );

  fetch(`${RosterRecord.url}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courses: Object.values(newCourses),
      projects: Object.values(newProjects),
      users: Object.values(newUsers),
      modifiedUsers: Object.values(modifiedUsers),
    }),
  })
    .then((res) => res.json())
    .then(({ error, data }) => {
      if (error) return dispatchError(error);
      console.log({ data });
      dispatchError(new Error("post OK, but success handler not written"));
    });
};

export default bulkImport;
