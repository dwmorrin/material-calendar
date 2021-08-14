import { AdminAction } from "../types";
import { ResourceKey } from "../../resources/types";
import RosterRecord from "../../resources/RosterRecord";
import Course from "../../resources/Course";
import Project from "../../resources/Project";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import { BulkImporter } from "./router";

const headings = [
  "Course",
  "Catalog",
  "Section",
  "Instructor",
  "Student",
  "NetID",
  "Restriction",
  "Project",
];

const bulkImport: BulkImporter = (setSubmitting, dispatch, records) => {
  const dispatchError = (error: Error): void => {
    setSubmitting(false);
    dispatch({ type: AdminAction.Error, payload: { error } });
  };

  if (!Array.isArray(records))
    return dispatchError(
      new Error(
        "Roster import failed: could not parse roster (records not an array)"
      )
    );

  fetch(`${RosterRecord.url}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(records),
  })
    .then((res) => res.json())
    .then(({ error, data }) => {
      if (error) throw error;
      const courses: Course[] = data.courses;
      const projects: Project[] = data.projects;
      const users: User[] = data.users;
      const rosterRecords: RosterRecord[] = data.rosterRecords;
      const groups: UserGroup[] = data.groups;
      if (
        ![courses, projects, users, rosterRecords, groups].every(Array.isArray)
      )
        throw new Error("Missing resources after roster import");
      setSubmitting(false);
      dispatch({
        type: AdminAction.FileImportSuccess,
        payload: {
          resources: {
            [ResourceKey.Courses]: courses.map((c) => new Course(c)),
            [ResourceKey.Projects]: projects.map((p) => new Project(p)),
            [ResourceKey.Users]: users.map((u) => new User(u)),
            [ResourceKey.RosterRecords]: rosterRecords.map(
              (r) => new RosterRecord(r)
            ),
            [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
