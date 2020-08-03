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
import {
  dateGenerator,
  hoursDifference,
  parseTimeFromDate,
  stringifyTime,
  trimTZ,
} from "../utils/date";
import { ResourceKey } from "../resources/types";

export const mapRepeatToNumber = (repeat: string): number => {
  switch (repeat) {
    case "sunday":
      return 0;
    case "monday":
      return 1;
    case "tuesday":
      return 2;
    case "wednesday":
      return 3;
    case "thursday":
      return 4;
    case "friday":
      return 5;
    case "saturday":
      return 6;
    default:
      return -1;
  }
};

const getRepeats = (repeats: FormValues): number[] =>
  Object.entries(repeats).reduce(
    (days, [day, selected]) =>
      selected ? [...days, mapRepeatToNumber(day)] : days,
    [] as number[]
  );

export const makeOnSubmit = (
  dispatch: (action: Action) => void,
  state: AdminState,
  semester: Semester,
  locationId: number
) => (values: FormValues, actions: FormikValues): void => {
  const start = { ...parseTimeFromDate(values.start as string), seconds: 0 };
  const end = { ...parseTimeFromDate(values.end as string), seconds: 0 };
  const from = values.from as {
    start: string;
    end: string;
    allSemester: boolean;
  };

  const makeDailyHours = (date: string): Omit<LocationHours, "id"> => ({
    hours: hoursDifference(start, end),
    date,
    semesterId: semester.id,
    locationId,
    start: stringifyTime(start),
    end: stringifyTime(end),
  });

  const repeats = getRepeats(values.repeat as FormValues);
  const range = from.allSemester ? semester : from;
  const hours = [
    ...dateGenerator(trimTZ(range.start), trimTZ(range.end), repeats),
  ].map(makeDailyHours);

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

  const cleanup = (): void => actions.setSubmitting(false);

  fetch(`${Location.url}/${locationId}/hours/bulk`, {
    method: "POST",
    body: JSON.stringify(hours),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then(handleData)
    .catch(dispatchError)
    .finally(cleanup);
};
