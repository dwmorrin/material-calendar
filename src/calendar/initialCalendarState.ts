import Event from "./Event";
import { CalendarState } from "./types";
import Project from "./Project";

export const testModifiedState: CalendarState = {
  currentEvent: new Event({ location: "", locationId: "", open: true }),
  currentProject: new Project({
    end: "",
    id: "",
    locationIds: [],
    parentId: "",
    reservationEnd: "",
    reservationStart: "",
    selected: false,
    start: "",
    title: "",
  }),
  currentStart: new Date(),
  currentView: "resourceTimeGridDay",
  detailIsOpen: true,
  drawerIsOpen: true,
  error: new Error("just a test"),
  events: [],
  loading: true,
  locations: [],
  pickerShowing: true,
  projectDashboardIsOpen: true,
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
  projectDashboardIsOpen: false,
  projects: [],
  ref: null,
};
export default initialCalendarState;
