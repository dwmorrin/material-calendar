type DateInput = string | number | Date;

interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

export const stringifyTime = (time: Time): string => {
  const pad = (n: number): string => n.toString().padStart(2, "0");
  return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;
};

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
 * Calls .toJSON for YYYY-mm-ddddTHH:MM:SS.MMMTZ format, then removes
 * the trailing ".MMMTZ" info to remove timezone info.
 *
 * This is useful for coercing dates for FullCalendar and date/time pickers.
 */
export const removeTZInfo = (date: Date): string => date.toJSON().split(".")[0];

export const makeDateTimeInputString = ({
  date = new Date(),
  hours,
  minutes,
  unshift = true,
}: {
  date?: Date;
  hours?: number;
  minutes?: number;
  unshift?: boolean;
} = {}): string => {
  if (typeof hours === "number") date.setHours(hours);
  if (typeof minutes === "number") date.setMinutes(minutes);
  return removeTZInfo(unshift ? unshiftTZ(date) : date);
};

/**
 * get a "YYYY-mm-dd" formatted date string
 * @param date normal use is to leave this undefined
 */
export const makeDefaultDateInputString = (date = new Date()): string =>
  makeDateTimeInputString({ date }).split("T")[0];

export function setDefaultDates<T, K extends keyof T>(
  obj: T,
  ...dateKeys: K[]
): T {
  const defaultDate = makeDefaultDateInputString();
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

/**
 * Returns time string in "00:00:00" format
 */
export const getTimeFromDate = (date: Date | string): string =>
  unshiftTZ(new Date(date)).toJSON().split(/T|\./)[1];

export const parseTimeFromDate = (date: Date | string): Time =>
  parseTime(getTimeFromDate(date));

/**
 * If Time.hours and Time.minutes are equal, returns false since times are same,
 * not earlier/later.
 * @param earlier - the Time assumed to be earlier (true if earlier)
 * @param later  - the Time assumed to be earlier (true if later)
 */
export const compareTimeInputOrder = (earlier: Time, later: Time): boolean => {
  if (earlier.hours !== later.hours) return earlier.hours < later.hours;
  if (earlier.minutes !== later.minutes) return earlier.minutes < later.minutes;
  return false; // Times are equal to the minutes; they are same, not earlier/later
};

export const hoursDifference = (earlier: Time, later: Time): number => {
  const laterHours =
    later.hours +
    (compareTimeInputOrder(earlier, later) ? 0 : 24) +
    later.minutes / 60;
  const earlierHours = earlier.hours + earlier.minutes / 60;
  return Math.floor(laterHours - earlierHours);
};
