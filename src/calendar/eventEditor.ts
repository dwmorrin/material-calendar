import { makeStyles } from "@material-ui/core";
import { Action, ApiResponse, CalendarAction } from "../calendar/types";
import Event from "../resources/Event";
import { FormikValues } from "formik";
import { eventGenerator } from "../utils/date";
import { FormValues } from "../admin/types";
import { ResourceKey } from "../resources/types";

export const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  item: {
    marginTop: 30,
  },
});

export const initialEventOptions = {
  repeats: false,
  on: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },
  until: new Date(),
};

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

export const makeOnSubmit = (dispatch: (action: Action) => void) => (
  values: {
    id: number;
    start: Date;
    end: Date;
    title: string;
    reservable: boolean;
    location: { id: number; title: string };
    __options__: typeof initialEventOptions;
  },
  actions: FormikValues
): void => {
  const { repeats, on } = values.__options__;
  const days = getRepeats(on);
  const start = values.start;
  const end = values.end;
  const until = repeats ? values.__options__.until : start;

  // adapts for API interface
  const eventAdapter = ({
    start,
    end,
  }: {
    start: string;
    end: string;
  }): Omit<Event, "id"> => ({
    start,
    end,
    locationId: values.location.id,
    reservable: values.reservable,
    title: values.title,
  });

  const events = [...eventGenerator({ start, end, days, until })].map(
    eventAdapter
  );

  const dispatchError = (error: Error): void =>
    dispatch({ type: CalendarAction.Error, payload: { error } });

  const cleanup = (): void => actions.setSubmitting(false);

  const getUpdatedEvents = ({ error }: ApiResponse): void => {
    if (error) return dispatchError(error);
    fetch(Event.url)
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) return dispatchError(error);
        dispatch({
          type: CalendarAction.ReceivedResource,
            payload: {
              resources: {
                [ResourceKey.Events]: data.map((e: Event) => new Event(e)),
              },
            },
          meta: ResourceKey.Events,
        });
        dispatch({ type: CalendarAction.CloseEventEditor });
      });
  };

  fetch(`${Event.url}/bulk`, {
    method: "POST",
    body: JSON.stringify(events),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then(getUpdatedEvents)
    .catch(dispatchError)
    .finally(cleanup);
};

export interface EventEditorProps {
  dispatch: (action: Action) => void;
  open: boolean;
  event?: Event;
}
