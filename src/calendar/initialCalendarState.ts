import Event from "./Event";
import { CalendarState } from "./types";
import Project from "./Project";
import UserGroup from "../user/UserGroup";

export const testModifiedState: CalendarState = {
  currentEvent: new Event({
    location: "",
    open: true,
    reservationId: null,
    projectGroupId: 0,
    equipment: "",
  }),
  currentGroup: new UserGroup({
    id: 0,
    projectId: 0,
    memberIds: "",
    memberNames: "",
    title: "",
  }),
  currentProject: new Project({
    childrenIds: [],
    end: "",
    id: "",
    locationIds: [],
    manager: "",
    parentId: "",
    reservationEnd: "",
    reservationStart: "",
    selected: false,
    start: "",
    title: "",
  }),
  groups: [],
  currentStart: new Date(),
  currentView: "resourceTimeGridWeek",
  detailIsOpen: true,
  drawerIsOpen: true,
  error: new Error("just a test"),
  events: [],
  groupDashboardIsOpen: true,
  loading: false,
  locations: [{ id: "", selected: true, groupId: "" }],
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
  groupDashboardIsOpen: false,
  groups: [],
  loading: true,
  locations: [],
  pickerShowing: false,
  projectDashboardIsOpen: false,
  projects: [],
  ref: null,
};
export default initialCalendarState;
