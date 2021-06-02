import { add, lightFormat } from "date-fns/fp";
import { formatISO9075, parse, parseISO } from "date-fns";

type DateInput = string | number | Date;

interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

export const yyyymmdd = /\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[01])/;

const add1Day = add({ days: 1 });

const sqlFormat = {
  date: "yyyy-MM-dd",
  time: "HH:mm:ss",
  datetime: "yyyy-MM-dd HH:mm:ss",
};

export const formatJSON = lightFormat("yyyy-MM-dd'T'HH:mm:ss");
export const formatSlashed = lightFormat("MM/dd/yyyy");

export const formatSQLDate = (date = new Date()): string =>
  formatISO9075(date, { representation: "date" });

export const parseSQLDate = (dateStr: string): Date =>
  parse(dateStr, sqlFormat.date, new Date());

export const parseSQLDatetime = (dateStr: string): Date =>
  parse(dateStr, sqlFormat.datetime, new Date());

// Formats a FullCalendar (FC) event "dateStr" into local Date object
export const parseFCString = (fcStr: string): Date => parseISO(fcStr);

// Formats a FullCalendar (FC) event "dateStr" into a SQL format string
export const formatFCString = (fcStr: string): string =>
  formatISO9075(parseFCString(fcStr));

export function isDate(date?: DateInput): date is Date {
  return (
    !!date &&
    typeof date !== "string" &&
    typeof date !== "number" &&
    !Array.isArray(date) &&
    date.getTime !== undefined
  );
}

export function dateInputToNumber(dateInput?: DateInput): number {
  if (typeof dateInput === "string") return +new Date(dateInput);
  if (isDate(dateInput)) return +dateInput;
  if (typeof dateInput === "number") return dateInput;
  throw new Error(`could not convert date input {${dateInput}} to a number`);
}

export function compareDateOrder(
  earlier?: DateInput,
  later?: DateInput
): boolean {
  return dateInputToNumber(earlier) <= dateInputToNumber(later);
}

export function getFormattedDate(d: string | Date): string {
  if (typeof d === "string") {
    d = parseSQLDate(d);
    if (isNaN(d.valueOf()))
      throw new Error(`unknown date string format: "${d}"`);
  }
  return formatSlashed(d);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function getFormattedEventInterval(
  start: string | Date,
  end: string | Date
): string {
  const _start = !isDate(start) ? new Date(start) : start;
  const _end = !isDate(end) ? new Date(end) : end;
  const hasNoTimeInfo =
    typeof start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(start);
  const sameDay = isSameDay(_start, _end);

  const dateFormat = {
    weekday: "long" as "long" | "short" | "narrow" | undefined,
    day: "numeric" as "numeric" | "2-digit" | undefined,
    month: "long" as
      | "numeric"
      | "2-digit"
      | "long"
      | "short"
      | "narrow"
      | undefined,
    timeZone: "UTC",
  };
  const timeFormat = {
    hour12: true,
    timeStyle: "short" as "long" | "short" | "full" | "medium" | undefined,
    timeZone: "UTC",
  };
  const timeDelimiter = " \u00B7 ";
  const intervalDelimiter = " - ";

  const startDateString = _start.toLocaleDateString("en-US", dateFormat);
  const startTimeString = hasNoTimeInfo
    ? ""
    : _start.toLocaleTimeString("en-US", timeFormat);
  const endDateString = sameDay
    ? ""
    : _end.toLocaleDateString("en-US", dateFormat);
  const endTimeString = hasNoTimeInfo
    ? ""
    : _end.toLocaleTimeString("en-US", timeFormat);

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

const minutesToMilliseconds = (minutes: number): number => minutes * 6e4;

/**
 * useful for shifting a local Date to a UTC date for the purpose of getting at
 * the .toISOString() or .toJSON() string formats with a local Date.
 * @param date
 */
export const unshiftTZ = (date: Date): Date =>
  new Date(date.getTime() - minutesToMilliseconds(date.getTimezoneOffset()));

/**
 * formats a date string to "YYYY-mm-dd HH:MM:SS" format for MySQL storage
 * @param date a valid date string for Date.parse()
 */
export const formatForMySQL = (date: string): string => {
  if (yyyymmdd.test(date)) return date;
  return unshiftTZ(new Date(date)).toJSON().replace("T", " ").split(".")[0];
};

export function setDefaultDates<T, K extends keyof T>(
  obj: T,
  ...dateKeys: K[]
): T {
  const defaultDate = formatISO9075(new Date());
  const copy = { ...obj };
  dateKeys.forEach((key) => {
    if (!copy[key]) copy[key] = defaultDate as never;
    if (typeof copy[key] === "string")
      copy[key] = ((copy[key] as unknown) as string).split(".")[0] as never;
  });
  return copy;
}

export const parseTime = (timeString: string): Time =>
  timeString.split(":").reduce(
    (time, str, index) => ({
      ...time,
      [index === 0 ? "hours" : index === 1 ? "minutes" : "seconds"]: +str,
    }),
    {} as Time
  );

export interface EventDuration {
  start: Date;
  end: Date;
}
interface EventGeneratorProps extends EventDuration {
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

export const subtractOneDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() - 1);
  return copy;
};

export const trimTZ = (dateString: string): string => dateString.split(".")[0];
