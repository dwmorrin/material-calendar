import { FindResource } from "../resources/Resources";
import { ResourceKey } from "../resources/types";
import { ErrorType } from "../utils/error";

type Dispatch = (action: {
  type: number;
  payload: { [k: string]: unknown };
  meta?: unknown;
}) => void;

const dispatchError = (dispatch: Dispatch, type: number, error: Error): void =>
  dispatch({
    type,
    payload: { error },
    meta: ErrorType.MISSING_RESOURCE,
  });

const dispatchAllResources = (
  dispatch: Dispatch,
  type: number,
  responses: { data?: unknown[]; context?: string; error?: Error }[]
): void =>
  dispatch({
    type,
    payload: {
      resources: {
        ...responses.reduce((all, { data, context, error }) => {
          if (typeof context !== "string") {
            throw new Error(
              "Server did not provide context for our data request"
            );
          }
          if (!Array.isArray(data)) {
            throw new Error(
              `While looking for ${ResourceKey[+context]} data, we received: ${
                error?.message || "unknown error"
              }`
            );
          }
          return {
            ...all,
            [+context]: data.map(
              (d) => new (FindResource(+context))(d as never)
            ),
          };
        }, {}),
      },
    },
  });

const fetchAllResources = (
  dispatch: Dispatch,
  onFulfilledType: number,
  onRejectedType: number,
  ...endpoints: string[]
): Promise<void> =>
  Promise.all(
    endpoints.map((url) =>
      fetch(url, { headers: { "Content-Type": "application/json" } })
    )
  )
    .then((responses) => {
      if (responses.some(({ ok }) => !ok)) {
        dispatchError(
          dispatch,
          onRejectedType,
          new Error("Server had a problem. Try again later.")
        );
      } else
        Promise.all(responses.map((response) => response.json()))
          .then((dataArray) =>
            dispatchAllResources(dispatch, onFulfilledType, dataArray)
          )
          .catch((error) => dispatchError(dispatch, onRejectedType, error));
    })
    .catch((error) => dispatchError(dispatch, onRejectedType, error));

export default fetchAllResources;
