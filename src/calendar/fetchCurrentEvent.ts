import { Action, CalendarAction } from "./types";
import Event from "../resources/Event";
import { deepEqual } from "fast-equals";

/**
 * Check if the current event on the server is the same as the event passed in.
 * Should be called when EventDetail.tsx is becoming visible.
 * Called when OpenEventDetail and CloseReservationForm are dispatched.
 */
export default function fetchCurrentEvent(
  dispatch: (action: Action) => void,
  currentEvent: Event
): void {
  const dispatchError = (error: Error): void =>
    dispatch({ type: CalendarAction.Error, payload: { error } });
  fetch(`${Event.url}/${currentEvent.id}`)
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error) return dispatchError(error);
      const event = new Event(data);
      if (!deepEqual(event, currentEvent))
        dispatch({
          type: CalendarAction.FoundStaleCurrentEvent,
          payload: { currentEvent: event },
        });
    })
    .catch(dispatchError);
}
