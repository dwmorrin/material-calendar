import { FormikValues } from "formik";
import {
  FormValues,
  Action,
  AdminAction,
  AdminState,
  ApiResponse,
} from "./types";
import Semester from "../resources/Semester";
import {
  areIntervalsOverlapping,
  formatSQLDate,
  parseSQLDate,
} from "../utils/date";
import { ResourceKey } from "../resources/types";
import VirtualWeek from "../resources/VirtualWeek";

export const makeOnSubmit =
  (
    dispatch: (action: Action) => void,
    state: AdminState,
    semester: Semester,
    locationId: number
  ) =>
  (values: FormValues, actions: FormikValues): void => {
    const vws = (
      state.resources[ResourceKey.VirtualWeeks] as VirtualWeek[]
    ).filter(({ locationId: id }) => id === locationId);
    const start = values.start as Date;
    const end = values.end as Date;
    const overlapsInput = areIntervalsOverlapping({
      start,
      end,
    });
    if (
      vws.some((vw) =>
        overlapsInput({
          start: parseSQLDate(vw.start),
          end: parseSQLDate(vw.end),
        })
      )
    )
      //TODO this is just temporary; having trouble getting Formik validate to work with this
      return console.log("overlap detected, submit aborted");

    const dispatchError = (error: Error): void =>
      dispatch({ type: AdminAction.Error, payload: { error } });

    const handleData = ({ error }: ApiResponse): void => {
      if (error) return dispatchError(error);
      fetch(`${VirtualWeek.url}`)
        .then((response) => response.json())
        .then(({ error, data }) =>
          dispatch(
            error || !data
              ? { type: AdminAction.Error, payload: { error } }
              : {
                  type: AdminAction.ReceivedResource,
                  meta: ResourceKey.VirtualWeeks,
                  payload: {
                    resources: {
                      ...state.resources,
                      [ResourceKey.VirtualWeeks]: (data as VirtualWeek[]).map(
                        (vw) => new VirtualWeek(vw)
                      ),
                    },
                  },
                }
          )
        )
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
