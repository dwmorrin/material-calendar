import { Action, ApiResponse, CalendarAction } from "../types";
import Event from "../../resources/Event";
import Location from "../../resources/Location";
import { FormikValues } from "formik";
import {
  addDays,
  compareAscSQLDate,
  differenceInMinutes,
  differenceInHoursSQLDatetime,
  endOfDay,
  formatSQLDate,
  formatSQLDatetime,
  isWithinIntervalFP,
  parseSQLDatetime,
  startOfDay,
} from "../../utils/date";
import { ResourceKey } from "../../resources/types";
import { SocketMessageKind } from "../SocketProvider";

export type NewEvent = Omit<Event, "id">;

interface DateInterval {
  start: Date;
  end: Date;
}
interface EventGeneratorProps extends DateInterval {
  until: Date;
  days: number[];
  hasHoursAvailable: (di: DateInterval) => InvervalHoursInfo;
}

interface InvervalHoursInfo {
  max: number;
  existing: number;
}

export interface GeneratedInterval {
  start: string;
  end: string;
  skipped: boolean;
  hours: InvervalHoursInfo & { requested: number };
}

const eventGenerator = ({
  start,
  end,
  until,
  days,
  hasHoursAvailable,
}: EventGeneratorProps): {
  [Symbol.iterator](): Generator<GeneratedInterval>;
} => ({
  *[Symbol.iterator](): Generator<GeneratedInterval> {
    const untilValue = until.valueOf();
    while (untilValue >= start.valueOf()) {
      if (!days.length || days.includes(start.getUTCDay())) {
        const { max, existing } = hasHoursAvailable({ start, end });
        const requested = differenceInMinutes(end, start) / 60;
        yield {
          start: formatSQLDatetime(start),
          end: formatSQLDatetime(end),
          skipped: existing + requested >= max,
          hours: {
            max,
            existing,
            requested,
          },
        };
      }
      start = addDays(start, 1);
      end = addDays(end, 1);
    }
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

const getRepeats = (repeats: Record<string, unknown>): number[] =>
  Object.entries(repeats).reduce(
    (days, [day, selected]) =>
      selected ? [...days, mapRepeatToNumber(day)] : days,
    [] as number[]
  );

interface EventValues {
  id: number;
  start: Date;
  end: Date;
  title: string;
  reservable: boolean;
  location: { id: number; title: string };
  __options__: typeof initialEventOptions;
  __delete__?: boolean;
}

interface SubmitProps {
  eventId: number;
  dispatch: (action: Action) => void;
  generatedEvents: NewEvent[];
  broadcast: (message: string) => void;
  deleteOne: boolean;
}

export const afterConfirmed = ({
  eventId,
  dispatch,
  generatedEvents,
  broadcast,
  deleteOne,
}: SubmitProps): void => {
  const dispatchError = (error: Error): void =>
    dispatch({ type: CalendarAction.Error, payload: { error } });

  if (deleteOne) {
    fetch(`${Event.url}/${eventId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: eventId }),
    })
      .then((res) => res.json())
      .then(({ error }) => {
        if (error) {
          dispatchError(error);
        } else {
          dispatch({
            type: CalendarAction.DeletedOneEvent,
            meta: eventId,
          });
          // TODO broadcast
          //broadcast(SocketMessageKind.DeleteEvent);
        }
      })
      .catch(dispatchError);
    return;
  }

  if (!generatedEvents.length) return;

  const getCreatedEvents = ({ error, data }: ApiResponse): void => {
    if (error) throw error;
    if (!data) throw new Error("no data after creating events");
    const { events } = data as { events: Event[] };
    if (!Array.isArray(events))
      throw new Error("no events after creating events");
    dispatch({
      type: CalendarAction.CreatedEventsReceived,
      payload: {
        resources: {
          [ResourceKey.Events]: events.map((e: Event) => new Event(e)),
        },
      },
      meta: ResourceKey.Events,
    });
    broadcast(SocketMessageKind.EventsChanged);
  };

  const getUpdatedEvent = ({ error, data }: ApiResponse): void => {
    if (error) throw error;
    if (!data) throw new Error("no data after updating event");
    const { event } = data as { event: Event };
    dispatch({
      type: CalendarAction.UpdatedEditedEventReceived,
      payload: {
        currentEvent: new Event(event),
      },
      meta: ResourceKey.Events,
    });
    broadcast(SocketMessageKind.EventsChanged);
  };

  const headers = { "Content-Type": "application/json" };

  if (eventId < 1)
    // creating
    fetch(`${Event.url}/bulk`, {
      method: "POST",
      body: JSON.stringify(generatedEvents),
      headers,
    })
      .then((response) => response.json())
      .then(getCreatedEvents)
      .catch(dispatchError);
  // updating
  else
    fetch(`${Event.url}/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(generatedEvents[0]),
      headers,
    })
      .then((response) => response.json())
      .then(getUpdatedEvent)
      .catch(dispatchError);
};

interface ConfirmationProps {
  dispatch: (action: Action) => void;
  location: Location;
  events: Event[];
  setSkipped: (skipped: GeneratedInterval[]) => void;
  setGenerated: (generated: NewEvent[]) => void;
  setConfirmationDialogIsOpen: (open: boolean) => void;
  broadcast: (message: string) => void;
}

/**
 * locationEvents are not guaranteed to be in order
 */
export const makeConfirmation =
  ({
    dispatch,
    location,
    events,
    setSkipped,
    setGenerated,
    setConfirmationDialogIsOpen,
    broadcast,
  }: ConfirmationProps) =>
  (values: EventValues, actions: FormikValues): void => {
    actions.setSubmitting(false);
    if (values.__delete__) {
      afterConfirmed({
        generatedEvents: [],
        eventId: values.id,
        dispatch,
        broadcast,
        deleteOne: true,
      });
      return;
    }

    const { repeats, on } = values.__options__;
    const days = getRepeats(on);
    const start = values.start;
    const end = values.end;
    const until = repeats ? values.__options__.until : start;

    const hours = Location.getHours(location, {
      start: formatSQLDate(start),
      end: formatSQLDate(until),
    });

    const isWithinGenerator = isWithinIntervalFP({
      start: startOfDay(start),
      end: endOfDay(until),
    });

    const locationEvents = events.filter(
      ({ start, location: { id } }) =>
        id === location.id && isWithinGenerator(parseSQLDatetime(start))
    );

    locationEvents.sort(({ start: a }, { start: b }) =>
      compareAscSQLDate({ start: a, end: b })
    );

    const dailyUsage = locationEvents.reduce((acc, event) => {
      const key = event.start.split(" ")[0];
      acc[key] = acc[key] || 0;
      acc[key] += differenceInHoursSQLDatetime(event);
      return acc;
    }, {} as Record<string, number>);

    const hasHoursAvailable = ({ start }: DateInterval): InvervalHoursInfo => {
      const dateString = formatSQLDate(start);
      return {
        existing: dailyUsage[dateString] || 0,
        max: hours.find(({ date }) => date === dateString)?.hours || 0,
      };
    };

    const generatedIntervals = [
      ...eventGenerator({
        start,
        end,
        days,
        until,
        hasHoursAvailable,
      }),
    ];
    const newEvents = generatedIntervals
      .filter(({ skipped }) => !skipped)
      .map(
        ({ start, end }): NewEvent => ({
          start,
          end,
          locationId: values.location.id,
          reservable: values.reservable,
          title: values.title,
        })
      );
    setGenerated(newEvents);

    const skippedEvents = generatedIntervals.filter(({ skipped }) => skipped);
    if (skippedEvents.length) {
      setSkipped(skippedEvents);
      setConfirmationDialogIsOpen(true);
    }

    if (newEvents.length && !skippedEvents.length) {
      afterConfirmed({
        generatedEvents: newEvents,
        eventId: values.id,
        dispatch,
        broadcast,
        deleteOne: false,
      });
    }
  };
