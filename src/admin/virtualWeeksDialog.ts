import { FormikValues } from "formik";
import {
  FormValues,
  Action,
  AdminAction,
  AdminState,
  ApiResponse,
} from "./types";
import Location from "../resources/Location";
import Semester from "../resources/Semester";
import { formatSQLDate } from "../utils/date";
import { ResourceKey } from "../resources/types";
import VirtualWeek from "../resources/VirtualWeek";
import { areIntervalsOverlapping } from "date-fns/fp";
import { parseJSON } from "date-fns";

export const makeOnSubmit =
  (
    dispatch: (action: Action) => void,
    state: AdminState,
    semester: Semester,
    locationId: number
  ) =>
  (values: FormValues, actions: FormikValues): void => {
    const vws = state.resources[ResourceKey.VirtualWeeks] as VirtualWeek[];
    const start = values.start as Date;
    const end = values.end as Date;
    const overlapsInput = areIntervalsOverlapping({
      start: parseJSON(start),
      end: parseJSON(end),
    });
    if (
      vws.some((vw) =>
        overlapsInput({ start: parseJSON(vw.start), end: parseJSON(vw.end) })
      )
    )
      return console.log("overlap detected, submit aborted"); //TODO this is just temporary

    const dispatchError = (error: Error): void =>
      dispatch({ type: AdminAction.Error, payload: { error } });

    const handleData = ({ error }: ApiResponse): void => {
      if (error) return dispatchError(error);
      fetch(`${Location.url}`)
        .then((response) => response.json())
        .catch(dispatchError);
    };

    const cleanup = (): void => {
      actions.setSubmitting(false);
      dispatch({
        type: AdminAction.CloseVirtualWeeksDialog,
      });
    };

    fetch(`${VirtualWeek.url}/`, {
      method: "POST",
      body: JSON.stringify({
        start: formatSQLDate(start),
        end: formatSQLDate(end),
        locationId,
        semesterId: semester.id,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then(handleData)
      .catch(dispatchError)
      .finally(cleanup);
  };
