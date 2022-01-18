import { BulkImporter } from "./router";
import { AdminAction } from "../types";
import { ResourceKey } from "../../../resources/types";
import Course from "../../../resources/Course";

export const headings = [
  "Restriction",
  "Last",
  "First",
  "Username",
  "Email",
  "Course",
  "Section",
  "Title",
];

const bulkImport: BulkImporter = (setSubmitting, dispatch, records): void => {
  const dispatchError = (error: Error): void => {
    setSubmitting(false);
    dispatch({ type: AdminAction.Error, payload: { error } });
  };
  if (!Array.isArray(records))
    return dispatchError(
      new Error("Import failed, could not parse input as an array")
    );

  const body = JSON.stringify(
    records.map((record) => ({
      course: record.Course,
      section: record.Section,
      title: record.Title,
    }))
  );

  fetch(`${Course.url}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
    .then((res) => res.json())
    .then(({ error, data }) => {
      if (error) throw error;
      setSubmitting(false);
      dispatch({
        type: AdminAction.FileImportSuccess,
        payload: {
          resources: {
            [ResourceKey.Courses]: (data as Course[]).map((c) => new Course(c)),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
