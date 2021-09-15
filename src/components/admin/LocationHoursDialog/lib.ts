import { FormikValues } from "formik";
import {
  Action,
  AdminAction,
  AdminState,
  ApiResponse,
} from "../../../admin/types";
import Location from "../../../resources/Location";
import { ResourceKey } from "../../../resources/types";
import { formatSQLDate } from "../../../utils/date";

export interface LocationHoursValues {
  date: Date;
  hours: string;
  useDefault: boolean;
}

export const makeOnSubmit =
  (dispatch: (action: Action) => void, state: AdminState, locationId: number) =>
  (values: Record<string, unknown>, actions: FormikValues): void => {
    const { days } = values as { days: LocationHoursValues[] };

    const dailyHours = days.map(({ date, hours, useDefault }) => ({
      date: formatSQLDate(date),
      hours: Number(hours),
      useDefault,
    }));

    const dispatchError = (error: Error): void =>
      dispatch({ type: AdminAction.Error, payload: { error } });

    const handleData = ({ error, data }: ApiResponse): void => {
      if (error) return dispatchError(error);
      const { locations } = data as {
        locations: Location[];
      };
      if (!Array.isArray(locations))
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
