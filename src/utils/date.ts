import {
  add,
  areIntervalsOverlappingWithOptions,
  lightFormat,
} from "date-fns/fp";
import {
  compareAsc,
  differenceInCalendarMonths,
  format,
  formatISO9075,
  getDay,
  isWithinInterval,
  parse,
  parseISO,
  set,
} from "date-fns";

export {
  addDays,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  subDays,
  subHours,
  subMinutes,
} from "date-fns";
export {
  areIntervalsOverlapping,
  isWithinInterval as isWithinIntervalFP,
} from "date-fns/fp";

interface DateStringInterval {
  start: string;
  end: string;
}

const sqlFormat = {
  date: "yyyy-MM-dd",
  time: "HH:mm:ss",
  datetime: "yyyy-MM-dd HH:mm:ss",
};

export const areIntervalsOverlappingInclusive =
  areIntervalsOverlappingWithOptions({ inclusive: true });

export const formatSlashed = lightFormat("MM/dd/yyyy");

export const formatDatetimeSeconds = lightFormat("MM/dd/yyyy h:mm:ss aaa");

export const formatDatetime = lightFormat("MM/dd/yyyy h:mm aaa");

export const formatSQLDate = (date = new Date()): string =>
  formatISO9075(date, { representation: "date" });

/**
 * alias for formatISO9075 for consistency with other date lib names
 * and adds default new Date()
 */
export const formatSQLDatetime = (date = new Date()): string =>
  formatISO9075(date);

export const parseSQLDate = (dateStr: string): Date =>
  parse(dateStr, sqlFormat.date, new Date());

export const parseSQLDatetime = (dateStr: string): Date =>
  parse(dateStr, sqlFormat.datetime, new Date());

// Formats a FullCalendar (FC) event "dateStr" into local Date object
export const parseFCString = (fcStr: string): Date => parseISO(fcStr);

// Formats a FullCalendar (FC) event "dateStr" into a SQL format string
export const parseAndFormatFCString = (fcStr: string): string =>
  formatISO9075(parseFCString(fcStr));

export function isSameDay(a: Date, b: Date): boolean {
  return formatSQLDate(a) === formatSQLDate(b);
}

export const sqlIntervalInHours = (
  start: string | undefined,
  end: string | undefined
): number => {
  if (start && end) {
    return (
      (parseSQLDatetime(end).getTime() - parseSQLDatetime(start).getTime()) /
      3600000
    );
  } else return 0;
};

/** @private */
function formatInterval({
  hasNoTimeInfo,
  start,
  end,
}: {
  hasNoTimeInfo: boolean;
  start: Date;
  end: Date;
}): string {
  const showYear =
    differenceInCalendarMonths(end, new Date()) > 11 ||
    differenceInCalendarMonths(end, start) > 11;
  // formatting constants: potentially admin configurable options
  const timeDelimiter = " \u00B7 ";
  const intervalDelimiter = " - ";
  const dateFormat = `EE, MMM d${showYear ? ", yyyy" : ""}`;
  const timeFormat = "h:mm aaa";

  const startDateString = format(start, dateFormat);
  const startTimeString = hasNoTimeInfo ? "" : format(start, timeFormat);
  const endDateString = format(end, dateFormat);
  const endTimeString = hasNoTimeInfo ? "" : format(end, timeFormat);
  const sameDay = isSameDay(start, end);

  // hasNoTimeInfo && sameDay make for 4 possibilities:
  if (hasNoTimeInfo && sameDay) {
    return startDateString;
  }
  if (hasNoTimeInfo && !sameDay) {
    return startDateString + intervalDelimiter + endDateString;
  }
  if (!hasNoTimeInfo && sameDay) {
    return (
      startDateString +
      timeDelimiter +
      startTimeString +
      intervalDelimiter +
      endTimeString
    );
  }
  return (
    startDateString +
    timeDelimiter +
    startTimeString +
    intervalDelimiter +
    endDateString +
    timeDelimiter +
    endTimeString
  );
}

export function parseAndFormatSQLDateInterval({
  start,
  end,
}: DateStringInterval): string {
  return formatInterval({
    hasNoTimeInfo: true,
    start: parseSQLDate(start),
    end: parseSQLDate(end),
  });
}

export function parseAndFormatSQLDatetimeInterval({
  start,
  end,
}: DateStringInterval): string {
  return formatInterval({
    hasNoTimeInfo: false,
    start: parseSQLDatetime(start),
    end: parseSQLDatetime(end),
  });
}

interface DateInterval {
  start: Date;
  end: Date;
}
interface EventGeneratorProps extends DateInterval {
  until: Date;
  days: number[];
}

export const eventGenerator = ({
  start,
  end,
  until,
  days,
}: EventGeneratorProps): {
  [Symbol.iterator](): Generator<{ start: string; end: string }>;
} => ({
  *[Symbol.iterator](): Generator<{ start: string; end: string }> {
    const formatJSON = lightFormat("yyyy-MM-dd'T'HH:mm:ss");
    const add1Day = add({ days: 1 });
    const untilValue = until.valueOf();
    while (untilValue >= start.valueOf()) {
      if (!days.length || days.includes(start.getUTCDay())) {
        yield {
          start: formatJSON(start),
          end: formatJSON(end),
        };
      }
      start = add1Day(start);
      end = add1Day(end);
    }
  },
});

export const compareAscSQLDate = ({
  start,
  end,
}: {
  start: string;
  end: string;
}): number => compareAsc(parseSQLDate(start), parseSQLDate(end));

export const isValidDateInterval = ({ start, end }: DateInterval): boolean =>
  compareAsc(start, end) < 1;

export const nowInServerTimezone = (): Date =>
  new Date(
    new Date().toLocaleString("en-US", {
      timeZone: process.env.REACT_APP_SERVER_TIMEZONE,
    })
  );

export const todayInServerTimezoneAtHour = (hours: number): Date =>
  set(nowInServerTimezone(), {
    hours,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

export const isValidSQLDateInterval = ({
  start,
  end,
}: {
  start: string;
  end: string;
}): boolean =>
  isValidDateInterval({
    start: parseSQLDate(start),
    end: parseSQLDate(end),
  });

export const isValidSQLDatetimeInterval = ({
  start,
  end,
}: {
  start: string;
  end: string;
}): boolean =>
  isValidDateInterval({
    start: parseSQLDatetime(start),
    end: parseSQLDatetime(end),
  });

export const castSQLDateToSQLDatetime = (date: string): string =>
  `${date} 00:00:00`;

export const isIntervalWithinInterval =
  (inner: DateInterval) =>
  (outer: DateInterval): boolean =>
    isWithinInterval(inner.start, outer) && isWithinInterval(inner.end, outer);

export const getDayNumberFromSQLDate = (date: string): number =>
  getDay(parseSQLDate(date));

export const getDayFromNumber = (
  dayNumber: number
):
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday" => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];
  return days[Math.floor(dayNumber) % 7];
};
