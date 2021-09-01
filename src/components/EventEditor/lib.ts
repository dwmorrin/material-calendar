import { Action, ApiResponse, CalendarAction } from "../../calendar/types";
import Event from "../../resources/Event";
import Location from "../../resources/Location";
import { FormikValues } from "formik";
import {
  addDays,
  compareAscSQLDate,
  differenceInHours,
  differenceInHoursSQLDatetime,
  endOfDay,
  formatSQLDate,
  formatSQLDatetime,
  isWithinIntervalFP,
  parseSQLDatetime,
  startOfDay,
} from "../../utils/date";
import { ResourceKey } from "../../resources/types";

interface DateInterval {
  start: Date;
  end: Date;
}
interface EventGeneratorProps extends DateInterval {
  until: Date;
  days: number[];
  hasHoursAvailable: (di: DateInterval, hours: number) => boolean;
}

interface GeneratedIntervals {
  start: string;
  end: string;
  hoursAvailable: boolean;
}

const eventGenerator = ({
  start,
  end,
  until,
  days,
  hasHoursAvailable,
}: EventGeneratorProps): {
  [Symbol.iterator](): Generator<GeneratedIntervals>;
} => ({
  *[Symbol.iterator](): Generator<GeneratedIntervals> {
    const untilValue = until.valueOf();
    while (untilValue >= start.valueOf()) {
      if (!days.length || days.includes(start.getUTCDay())) {
        yield {
          start: formatSQLDatetime(start),
          end: formatSQLDatetime(end),
          hoursAvailable: hasHoursAvailable(
            { start, end },
            differenceInHours(end, start)
          ),
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
}

/**
 * locationEvents are not guaranteed to be in order
 */
export const makeOnSubmit =
  (dispatch: (action: Action) => void, location: Location, events: Event[]) =>
  (values: EventValues, actions: FormikValues): void => {
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

    const hasHoursAvailable = (
      { start }: DateInterval,
      hoursToBeCreated: number
    ): boolean => {
      const dateString = formatSQLDate(start);
      const existingTotal = dailyUsage[dateString] || 0;
      const hoursAvailable =
        hours.find(({ date }) => date === dateString)?.hours || 0;
      return existingTotal + hoursToBeCreated <= hoursAvailable;
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

    const skippedEvents = generatedIntervals.filter(
      ({ hoursAvailable }) => !hoursAvailable
    );
    // TODO - show skipped events in a modal
    console.log({ skippedEvents });

    const generatedEvents = generatedIntervals
      .filter(({ hoursAvailable }) => hoursAvailable)
      .map(
        ({ start, end }): Omit<Event, "id"> => ({
          start,
          end,
          locationId: values.location.id,
          reservable: values.reservable,
          title: values.title,
        })
      );

    const dispatchError = (error: Error): void =>
      dispatch({ type: CalendarAction.Error, payload: { error } });

    const cleanup = (): void => actions.setSubmitting(false);

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
    };

    const getUpdatedEvent = ({ error, data }: ApiResponse): void => {
      if (error) throw error;
      if (!data) throw new Error("no data after updating event");
      const { event } = data as { event: Event };
      dispatch({
        type: CalendarAction.UpdatedEventReceived,
        payload: {
          currentEvent: new Event(event),
        },
        meta: ResourceKey.Events,
      });
    };

    const headers = { "Content-Type": "application/json" };

    if (values.id < 1)
      // creating
      fetch(`${Event.url}/bulk`, {
        method: "POST",
        body: JSON.stringify(generatedEvents),
        headers,
      })
        .then((response) => response.json())
        .then(getCreatedEvents)
        .catch(dispatchError)
        .finally(cleanup);
    // updating
    else
      fetch(`${Event.url}/${values.id}`, {
        method: "PUT",
        body: JSON.stringify({
          start: formatSQLDatetime(start),
          end: formatSQLDatetime(end),
          locationId: values.location.id,
          reservable: values.reservable,
          title: values.title,
        }),
        headers,
      })
        .then((response) => response.json())
        .then(getUpdatedEvent)
        .catch(dispatchError)
        .finally(cleanup);
  };
