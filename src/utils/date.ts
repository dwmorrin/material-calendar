import { add, lightFormat } from "date-fns/fp";
import { format, formatISO9075, parse, parseISO } from "date-fns";

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

export function isSameDay(a: Date, b: Date): boolean {
  const aDateString = formatSQLDate(a);
  const bDateString = formatSQLDate(b);
  return aDateString === bDateString;
}

export function getFormattedEventInterval(start: string, end: string): string {
  [start, end] = [start, end].map((s) => s.replace("T", " "));
  const hasNoTimeInfo = /^\d{4}-\d{2}-\d{2}$/.test(start);
  const _start = hasNoTimeInfo ? parseSQLDate(start) : parseSQLDatetime(start);
  const _end = hasNoTimeInfo ? parseSQLDate(end) : parseSQLDatetime(end);

  const timeDelimiter = " \u00B7 ";
  const intervalDelimiter = " - ";
  const dateFormat = "EE, MMM d";
  const timeFormat = "h:mm aaa";
  const startDateString = format(_start, dateFormat);
  const startTimeString = hasNoTimeInfo ? "" : format(_start, timeFormat);
  const endDateString = format(_end, dateFormat);
  const endTimeString = hasNoTimeInfo ? "" : format(_end, timeFormat);
  const sameDay = startDateString === endDateString;

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
