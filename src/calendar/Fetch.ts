import { Action, CalendarAction, CalendarState } from "./types";

/**
 * https://google.github.io/styleguide/jsoncstyleguide.xml
 * For reference or later integration:
export interface DataResponse {
  context?: string; // set by client; echoed by server
  id?: string; // server supplied identifier for debugging
  method?: string; // action taken by server to produce this response
  data?: object; // payload
  error?: {
    // data & error should be mutually exclusive
    code?: string; // https errors, e.g. "401"
    message?: string; // top level error message
    errors?: object[]; // list of errors; e.g. validation errors
  };
}
*/

interface FetchOptions {
  body?: {};
  credentials?: "same-origin";
  dispatch: (action: Action) => void;
  method?: "GET" | "POST";
  onFailureAction?: CalendarAction;
  onLoadingAction?: CalendarAction;
  onSuccessAction: CalendarAction;
  payloadKey: keyof CalendarState;
  url: string;
}

export const fetchCalendarData = (props: FetchOptions): void => {
  const {
    body = {},
    credentials = "same-origin",
    dispatch,
    method = "GET",
    onFailureAction = CalendarAction.Error,
    onLoadingAction = CalendarAction.Loading,
    onSuccessAction,
    payloadKey,
    url,
  } = props;
  dispatch({ type: onLoadingAction });
  const options: { [k: string]: string | {} } = {
    method,
    credentials,
  };
  if (method === "POST") {
    options.headers = { "Content-Type": "application/json" };
    options.body = body;
  }
  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      dispatch({
        type: onSuccessAction,
        payload: { [payloadKey]: data },
      });
    })
    .catch((error) => {
      dispatch({
        type: onFailureAction,
        payload: { error },
        error: true,
      });
    });
};
