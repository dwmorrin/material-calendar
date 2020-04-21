import Event from "./Event";
import { CalendarState } from "./types";

export const testModifiedState: CalendarState = {
  currentEvent: new Event({ location: "", open: true }),
  currentStart: new Date(),
  currentView: "resourceTimeGridDay",
  detailIsOpen: true,
  drawerIsOpen: true,
  error: new Error("just a test"),
  events: [],
  loading: true,
  locations: [],
  pickerShowing: true,
  projects: [],
  ref: null,
};

export const initialCalendarState: CalendarState = {
  currentStart: new Date(),
  currentView: "resourceTimeGridDay",
  detailIsOpen: false,
  drawerIsOpen: false,
  events: [],
  loading: true,
  locations: [],
  pickerShowing: false,
  projects: [],
  ref: null,
};
export default initialCalendarState;
