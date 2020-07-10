type DateInput = string | number | Date;

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
    d = new Date(d);
  }
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
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
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  };
  const timeFormat = { hour12: true, timeStyle: "short", timeZone: "UTC" };
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

export const yyyymmdd = /\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[01])/;

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

/**
 * get a "YYYY-mm-dd" formatted date string
 * @param date normal use is to leave this undefined
 */
export const makeDefaultDateInputString = (date = new Date()): string =>
  unshiftTZ(date).toJSON().split("T")[0];
