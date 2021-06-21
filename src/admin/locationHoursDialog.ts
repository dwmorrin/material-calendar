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

    const dispatchUpdatedLocations = ({ error, data }: ApiResponse): void => {
      if (error) return dispatchError(error);
      dispatch({
        type: AdminAction.ReceivedResource,
        payload: {
          resources: {
            ...state.resources,
            [ResourceKey.Locations]: data as Location[],
          },
        },
        meta: ResourceKey.Locations,
      });
    };

    const dispatchUpdatedVirtualWeeks = ({
      error,
      data,
    }: ApiResponse): void => {
      if (error) return dispatchError(error);
      dispatch({
        type: AdminAction.ReceivedResource,
        payload: {
          resources: {
            ...state.resources,
            [ResourceKey.VirtualWeeks]: data as VirtualWeek[],
          },
        },
        meta: ResourceKey.VirtualWeeks,
      });
    };

    const handleData = ({ error }: ApiResponse): void => {
      if (error) return dispatchError(error);
      fetch(`${Location.url}`)
        .then((response) => response.json())
        .then(dispatchUpdatedLocations)
        .then(() =>
          fetch(VirtualWeek.url)
            .then((response) => response.json())
            .then(dispatchUpdatedVirtualWeeks)
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
