import { FormikValues } from "formik";
import {
  FormValues,
  Action,
  AdminAction,
  AdminState,
  ApiResponse,
} from "./types";
import Location, { LocationHours } from "../resources/Location";
import { ResourceKey } from "../resources/types";
import { formatSQLDate } from "../utils/date";
import VirtualWeek from "../resources/VirtualWeek";

export type DailyHoursValue = { date: Date; hours: number };

export const makeOnSubmit =
  (dispatch: (action: Action) => void, state: AdminState, locationId: number) =>
  (values: FormValues, actions: FormikValues): void => {
    const { days } = values as { days: DailyHoursValue[] };

    const makeDailyHours = (
      date: string,
      hours: string | number
    ): Omit<LocationHours, "id"> => ({
      hours: Number(hours),
      date,
    });

    const dailyHours = days.map(({ date, hours }) =>
      makeDailyHours(formatSQLDate(date), hours)
    );

    const dispatchError = (error: Error): void =>
      dispatch({ type: AdminAction.Error, payload: { error } });

    const handleData = ({ error }: ApiResponse): void => {
      if (error) return dispatchError(error);
      Promise.all([
        fetch(`${Location.url}?context=${ResourceKey.Locations}`),
        fetch(`${VirtualWeek.url}?context=${ResourceKey.VirtualWeeks}`),
      ])
        .then((responses) =>
          Promise.all(responses.map((response) => response.json()))
            .then((dataArray) => {
              if (dataArray.some(({ error }) => !!error))
                // returning the first error only; better if we could return all
                return dispatchError(
                  dataArray.find(({ error }) => !!error).error
                );
              const locations = dataArray.find(
                ({ context }) => Number(context) === ResourceKey.Locations
              );
              if (!locations || !Array.isArray(locations.data))
                return dispatchError(
                  new Error("no locations returned in allotment update")
                );
              const virtualWeeks = dataArray.find(
                ({ context }) => Number(context) === ResourceKey.VirtualWeeks
              );
              if (!virtualWeeks || !Array.isArray(virtualWeeks.data))
                return dispatchError(
                  new Error("no virtual weeks returned in allotment update")
                );
              dispatch({
                type: AdminAction.ReceivedResourcesAfterLocationHoursUpdate,
                payload: {
                  resources: {
                    ...state.resources,
                    [ResourceKey.Locations]: locations.data.map(
                      (l: Location) => new Location(l)
                    ),
                    [ResourceKey.VirtualWeeks]: virtualWeeks.data.map(
                      (v: VirtualWeek) => new VirtualWeek(v)
                    ),
                  },
                },
              });
            })
            .catch(dispatchError)
        )
        .catch(dispatchError);
    };

    const cleanup = (): void => {
      actions.setSubmitting(false);
      dispatch({
        type: AdminAction.CloseLocationHoursDialog,
      });
    };

    fetch(`${Location.url}/${locationId}/hours/bulk`, {
      method: "POST",
      body: JSON.stringify(dailyHours),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then(handleData)
      .catch(dispatchError)
      .finally(cleanup);
  };
