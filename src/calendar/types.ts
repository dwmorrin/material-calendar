import Event from "./Event";
import Location from "./Location";
import Project from "./Project";
import FullCalendar from "@fullcalendar/react";
import UserGroup from "../user/UserGroup";

export enum CalendarAction {
  ChangedView,
  CloseEventDetail,
  CloseProjectDashboard,
  CloseReservationForm,
  CloseGroupDashboard,
  Error,
  Loading,
  PickedDate,
  OpenGroupDashboard,
  OpenProjectDashboard,
  OpenReservationForm,
  ReceivedEvents,
  ReceivedGroups,
  ReceivedLocations,
  ReceivedProjects,
  SelectedGroup,
  SelectedLocation,
  SelectedProject,
  ToggleDrawer,
  TogglePicker,
  ViewEventDetail,
  ViewToday
}

export type CalendarView =
  | "dayGridMonth"
  | "listWeek"
  | "resourceTimeGridDay"
  | "resourceTimeGridWeek";

export interface CalendarState {
  currentEvent?: Event;
  currentGroup?: UserGroup;
  currentProject?: Project;
  currentProjectGroups?: UserGroup[];
  currentStart: Date;
  currentView: string;
  detailIsOpen: boolean;
  drawerIsOpen: boolean;
  error?: Error;
  events: Event[];
  groupDashboardIsOpen: boolean;
  loading: boolean;
  locations: Location[];
  pickerShowing: boolean;
  projectDashboardIsOpen: boolean;
  GearListIsOpen: boolean;
  ReservationFormIsOpen: boolean;
  projects: Project[];
  ref: React.RefObject<FullCalendar> | null;
}

// https://github.com/redux-utilities/flux-standard-action
export interface Action {
  type: CalendarAction;
  payload?: Partial<CalendarState>;
  error?: boolean;
}

export type CalendarUIProps = {
  dispatch: (action: Action) => void;
  state: CalendarState;
};
