import { AdminAction } from "../types";
import Event from "../../resources/Event";
import { BulkImporter } from "./router";
import { ResourceKey } from "../../resources/types";

const headings = ["Title", "Location", "Start", "End", "Reservable"];

const bulkImport: BulkImporter = (setSubmitting, dispatch, events) => {
  const dispatchError = (error: Error): void => {
    setSubmitting(false);
    dispatch({ type: AdminAction.Error, payload: { error } });
  };
  if (!Array.isArray(events))
    return dispatchError(
      new Error(
        "Event import failed: could not parse file (records not an array)"
      )
    );
  fetch(`${Event.url}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      events.map(({ Title, Location, Start, End, Reservable }) => ({
        title: Title,
        locationId: Location,
        start: Start,
        end: End,
        reservable: Number(Reservable),
      }))
    ),
  })
    .then((response) => response.json())
    .then(({ data, error }) => {
      if (error) return dispatchError(error);
      setSubmitting(false);
      dispatch({
        type: AdminAction.FileImportSuccess,
        payload: {
          resources: {
            [ResourceKey.Events]: (data as Event[]).map((e) => new Event(e)),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
