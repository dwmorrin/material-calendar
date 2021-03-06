import { AdminAction, AdminState } from "../types";
import Event from "../../resources/Event";

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

const bulkImport = (
  dispatch: (action: {
    type: AdminAction;
    payload?: Partial<AdminState>;
  }) => void,
  events: unknown
): void => {
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

export default bulkImport;
