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

export function getFormattedEventInterval(
  start?: DateInput,
  end?: DateInput
): string {
  if (typeof start !== "string" || typeof end !== "string") {
    return "Oops, error! Unknown date!";
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateFormat = { weekday: "long", day: "numeric", month: "long" };
  const timeFormat = { hour12: true, timeStyle: "short" };
  return `${startDate.toLocaleDateString(
    "en-US",
    dateFormat
  )} \u00B7 ${startDate.toLocaleTimeString(
    "en-US",
    timeFormat
  )} - ${endDate.toLocaleTimeString("en-US", timeFormat)}`;
}
