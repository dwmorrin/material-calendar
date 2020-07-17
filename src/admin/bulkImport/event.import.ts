import { AdminAction } from "../types";
import Event from "../../resources/Event";
import { formatForMySQL } from "../../utils/date";

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
  start: formatForMySQL(event.start),
  end: formatForMySQL(event.end),
});

const bulkImport = (
  dispatch: (action: { type: AdminAction; payload?: {} }) => void,
  events: unknown
): void => {
  const errorHandler = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: error });
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
      dispatch({ type: AdminAction.SubmittingDocumentEnd });
    })
    .catch(errorHandler);
};

export default bulkImport;
