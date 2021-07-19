import { AdminAction } from "../types";
import Event from "../../resources/Event";
import { BulkImporter } from "./router";

interface FlatEvent {
  location: string | number;
  locationId: number;
  title: string;
  start: string;
  end: string;
  reservable: boolean;
}

const processEvent = (event: FlatEvent): FlatEvent => ({
  ...event,
  locationId: +event.location,
});

const headings = ["Title", "Location", "Start", "End", "Reservable"];

const bulkImport: BulkImporter = (dispatch, events) => {
  const errorHandler = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });
  const body = JSON.stringify((events as FlatEvent[]).map(processEvent));
  fetch(`${Event.url}/bulk`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body,
  })
    .then((response) => response.json())
    .then(({ data, error }) => {
      if (error || !data) return errorHandler(error);
    })
    .catch(errorHandler);
};

export default [headings, bulkImport] as [string[], BulkImporter];
