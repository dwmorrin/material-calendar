import { FindResource } from "../resources/types";

type Dispatch = (action: {
  type: number;
  payload: { [k: string]: unknown };
}) => void;

const dispatchError = (dispatch: Dispatch, type: number, error: Error): void =>
  dispatch({
    type,
    payload: { error },
  });

const dispatchAllResources = (
  dispatch: Dispatch,
  type: number,
  dataArray: { data: unknown[]; context: string }[]
): void =>
  dispatch({
    type,
    payload: {
      resources: {
        ...dataArray.reduce(
          (all, { data, context }) => ({
            ...all,
            [+context]: data.map(
              //! data is `any` but context should provide check
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              (d) => new (FindResource(+context))(d)
            ),
          }),
          {}
        ),
      },
    },
  });

const fetchAllResources = (
  dispatch: Dispatch,
  type: number,
  ...endpoints: string[]
): Promise<void> =>
  Promise.all(endpoints.map((url) => fetch(url)))
    .then((responses) =>
      Promise.all(responses.map((response) => response.json()))
        .then((dataArray) => dispatchAllResources(dispatch, type, dataArray))
        .catch((error) => dispatchError(dispatch, type, error))
    )
    .catch((error) => dispatchError(dispatch, type, error));

export default fetchAllResources;
