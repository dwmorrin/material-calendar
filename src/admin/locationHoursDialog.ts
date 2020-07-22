import { FormikValues } from "formik";
import { FormValues, Action, AdminAction, AdminState } from "./types";
import Location, { LocationHours } from "../resources/Location";
import Semester from "../resources/Semester";
import {
  dateGenerator,
  hoursDifference,
  parseTimeFromDate,
  stringifyTime,
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

  const getRepeats = (repeats: FormValues): number[] =>
    Object.entries(repeats).reduce(
      (days, [day, selected]) =>
        selected ? [...days, mapRepeatToNumber(day)] : days,
      [] as number[]
    );
  const repeats = getRepeats(values.repeat as FormValues);
  const range = from.allSemester ? semester : from;
  const hours = [
    ...dateGenerator(
      range.start.split(".")[0], // remove TZ info
      range.end.split(".")[0],
      repeats
    ),
  ].map(makeDailyHours);

  fetch(`${Location.url}/${locationId}/hours/bulk`, {
    method: "POST",
    body: JSON.stringify(hours),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then(({ error }) => {
      if (error)
        return dispatch({ type: AdminAction.Error, payload: { error } });
      fetch(`${Location.url}`)
        .then((response) => response.json())
        .then(({ error, data }) => {
          if (error)
            return dispatch({ type: AdminAction.Error, payload: { error } });
          dispatch({
            type: AdminAction.ReceivedResource,
            payload: {
              resources: {
                ...state.resources,
                [ResourceKey.Locations]: data,
              },
            },
            meta: ResourceKey.Locations,
          });
        })
        .catch((error) =>
          dispatch({ type: AdminAction.Error, payload: { error } })
        );
    })
    .catch((error) => dispatch({ type: AdminAction.Error, payload: { error } }))
    .finally(() => actions.setSubmitting(false));
};
