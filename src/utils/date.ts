import { DateInput } from "@fullcalendar/core/datelib/env";

function isDate(date?: DateInput): date is Date {
  return (
    !!date &&
    typeof date !== "string" &&
    typeof date !== "number" &&
    !Array.isArray(date) &&
    date.getTime !== undefined
  );
}

function dateInputToNumber(dateInput?: DateInput): number {
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
  });
}

export function getFormattedEventInterval(
  start: string | Date,
  end: string | Date
): string {
  if (typeof start === "string") {
    start = new Date(start);
  }
  if (typeof end === "string") {
    end = new Date(end);
  }
  if (start === undefined) start = new Date();
  if (end === undefined) end = new Date();
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const dateFormat = { weekday: "long", day: "numeric", month: "long" };
  const timeFormat = { hour12: true, timeStyle: "short" };
  const startFormatted = `${start.toLocaleDateString(
    "en-US",
    dateFormat
  )} \u00B7 ${start.toLocaleTimeString("en-US", timeFormat)}`;
  const endFormatted = `${
    !sameDay ? end.toLocaleDateString("en-US", dateFormat) + " \u00B7 " : ""
  }${end.toLocaleTimeString("en-US", timeFormat)}`;
  return `${startFormatted} - ${endFormatted}`;
}
