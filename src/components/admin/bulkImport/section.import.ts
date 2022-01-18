import { BulkImporter } from "./router";
import { AdminAction } from "../types";
import { ResourceKey } from "../../../resources/types";
import Section from "../../../resources/Section";

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
      username: record.Username,
      course: record.Course,
      section: record.Section,
    }))
  );

  fetch(`${Section.url}/bulk`, {
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
            [ResourceKey.Sections]: (data as Section[]).map(
              (s) => new Section(s)
            ),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
