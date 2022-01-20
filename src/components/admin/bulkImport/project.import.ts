import { BulkImporter } from "./router";
import { AdminAction } from "../types";
import { ResourceKey } from "../../../resources/types";
import Project from "../../../resources/Project";

export const headings = [
  "course",
  "title",
  "groupSize",
  "groupHours",
  "reservationStart",
  "start",
  "end",
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

  const body = JSON.stringify(records);

  fetch(`${Project.url}/bulk`, {
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
            [ResourceKey.Projects]: (data as Project[]).map(
              (c) => new Project(c)
            ),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
