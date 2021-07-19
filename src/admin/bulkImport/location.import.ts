import Location from "../../resources/Location";
import { AdminAction } from "../types";
import { ResourceKey } from "../../resources/types";
import { BulkImporter } from "./router";

export const headings = ["Title", "Group", "Restriction"];

const bulkImport: BulkImporter = (dispatch, records): void => {
  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });

  if (!Array.isArray(records))
    return dispatchError(
      new Error(
        "Roster import failed: could not parse roster (records not an array)"
      )
    );

  const body = JSON.stringify(
    records.map(({ Title, Group, Restriction }) => ({
      title: Title,
      location: Group,
      restriction: Number(Restriction),
    }))
  );

  fetch(`${Location.url}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
    .then((res) => res.json())
    .then(({ error, data }) => {
      if (error) return dispatchError(error);
      dispatch({
        type: AdminAction.ReceivedResourcesAfterLocationImport,
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
