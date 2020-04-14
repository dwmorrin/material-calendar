import { Action, CalendarAction } from "./types";

export const fetchCalendarData = (
  dispatch: (action: Action) => void,
  url: string
): void => {
  dispatch({
    type: CalendarAction.Loading,
  });
  fetch(url)
    .then((response) => response.json())
    .then((data) =>
      dispatch({
        type:
          url === "/events"
            ? CalendarAction.ReceivedEvents
            : CalendarAction.ReceivedLocations,
        payload: url === "/events" ? { events: data } : { locations: data },
      })
    )
    .catch((error) =>
      dispatch({
        type: CalendarAction.Error,
        payload: { error },
        error: true,
      })
    );
};
