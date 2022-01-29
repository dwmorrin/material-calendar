// encapsulate getting a date from FullCalendar from calendar state object
// depends on FullCalendar configuration
// see https://fullcalendar.io/docs/timeZone

import { CalendarState } from "../types";

function getFCDateFromState(state: CalendarState): Date {
  const res = state.ref?.current?.getApi().getDate();
  if (!res) {
    console.error("getFCDate: no ref");
    return new Date();
  }
  // assumes FC is configured to use "UTC-coercion" mode,
  // i.e. the timezone is set to a named timezone and no plugin is used
  // this converts to SQL date format, no timezone info
  const parsed: string = res.toISOString().replace("T", " ").split(".")[0];
  // parsing this SQL string will return a date object in the local timezone
  return new Date(parsed);
}

export default getFCDateFromState;
