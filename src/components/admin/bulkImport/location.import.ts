import Location from "../../../resources/Location";
import { AdminAction } from "../../../admin/types";
import { ResourceKey } from "../../../resources/types";
import { BulkImporter } from "./router";

export const headings = ["Title", "Group", "Restriction", "Allows Walk-Ins"];

const bulkImport: BulkImporter = (setSubmitting, dispatch, records): void => {
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

  const body = JSON.stringify(
    records.map((record) => ({
      title: record.Title,
      location: record.Group,
      restriction: Number(record.Restriction),
      allowsWalkIns: Number(record["Allows Walk-Ins"]),
    }))
  );

  fetch(`${Location.url}/bulk`, {
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
            [ResourceKey.Locations]: (data as Location[]).map(
              (l) => new Location(l)
            ),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
