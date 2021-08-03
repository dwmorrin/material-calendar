import { FormikValues } from "formik";
import { Action, AdminAction, AdminState, ApiResponse } from "./types";
import Location, { LocationHours } from "../resources/Location";
import { ResourceKey } from "../resources/types";
import { formatSQLDate } from "../utils/date";
import VirtualWeek from "../resources/VirtualWeek";

export type DailyHoursValue = { date: Date; hours: number };

export const makeOnSubmit =
  (dispatch: (action: Action) => void, state: AdminState, locationId: number) =>
  (values: Record<string, unknown>, actions: FormikValues): void => {
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

    const handleData = ({ error, data }: ApiResponse): void => {
      if (error) return dispatchError(error);
      const { locations, virtualWeeks } = data as {
        locations: Location[];
        virtualWeeks: VirtualWeek[];
      };
      if (!Array.isArray(locations) || !Array.isArray(virtualWeeks))
        return dispatchError(
          new Error("Updated locations and virtual weeks not sent.")
        );
      dispatch({
        type: AdminAction.ReceivedResourcesAfterLocationHoursUpdate,
        payload: {
          resources: {
            ...state.resources,
            [ResourceKey.Locations]: locations.map(
              (l: Location) => new Location(l)
            ),
            [ResourceKey.VirtualWeeks]: virtualWeeks.map(
              (v: VirtualWeek) => new VirtualWeek(v)
            ),
          },
        },
      });
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
