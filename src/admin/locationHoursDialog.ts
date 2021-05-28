import { FormikValues } from "formik";
import {
  FormValues,
  Action,
  AdminAction,
  AdminState,
  ApiResponse,
} from "./types";
import Location, { LocationHours } from "../resources/Location";
import Semester from "../resources/Semester";
import { formatISO9075 } from "date-fns";
import { ResourceKey } from "../resources/types";

export type DailyHoursValue = { date: Date; hours: number };

export const makeOnSubmit = (
  dispatch: (action: Action) => void,
  state: AdminState,
  semester: Semester,
  locationId: number
) => (values: FormValues, actions: FormikValues): void => {
  const { days } = values as { days: DailyHoursValue[] };

  const makeDailyHours = (
    date: string,
    hours: number
  ): Omit<LocationHours, "id"> => ({
    hours,
    date,
    semesterId: semester.id,
    locationId,
  });

  const dailyHours = days.map(({ date, hours }) =>
    makeDailyHours(formatISO9075(date, { representation: "date" }), hours)
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

  const handleData = ({ error }: ApiResponse): void => {
    if (error) return dispatchError(error);
    fetch(`${Location.url}`)
      .then((response) => response.json())
      .then(dispatchUpdatedLocations)
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
