import { AdminAction } from "../types";
import Event from "../../resources/Event";

const bulkImport = (
  dispatch: (action: { type: AdminAction; payload: {} }) => void,
  events: unknown
): void => {
  const errorHandler = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: error });

  fetch(`${Event.url}/bulk`, { method: "POST", body: JSON.stringify(events) })
    .then((response) => response.json())
    .then(({ data, error }) => {
      if (!data) return errorHandler(error);
      dispatch({
        type: AdminAction.Error,
        payload: {
          error: {
            message:
              "You did not implement success handler for event bulk import",
          },
        },
      });
    })
    .catch(errorHandler);
};

export default bulkImport;
