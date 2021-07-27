import { AdminAction } from "../types";
import { ResourceKey } from "../../resources/types";
import RosterRecord from "../../resources/RosterRecord";
import Course from "../../resources/Course";
import Project from "../../resources/Project";
import User from "../../resources/User";
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

  fetch(`${RosterRecord.url}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records }),
  })
    .then((res) => res.json())
    .then(({ error, data }) => {
      if (error) return dispatchError(error);
      setSubmitting(false);
      dispatch({
        type: AdminAction.ReceivedResourcesAfterRosterImport,
        payload: {
          resources: {
            [ResourceKey.Courses]: (data.courses as Course[]).map(
              (course) => new Course(course)
            ),
            [ResourceKey.Projects]: (data.projects as Project[]).map(
              (project) => new Project(project)
            ),
            [ResourceKey.Users]: (data.users as User[]).map(
              (user) => new User(user)
            ),
            [ResourceKey.RosterRecords]: (
              data.rosterRecords as RosterRecord[]
            ).map((rosterRecord) => new RosterRecord(rosterRecord)),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
