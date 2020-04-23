import Event from "./Event";
import Location from "./Location";
import Project from "./Project";
import FullCalendar from "@fullcalendar/react";

export enum CalendarAction {
  ChangedView,
  CloseEventDetail,
  CloseProjectDashboard,
  Error,
  Loading,
  PickedDate,
  OpenProjectDashboard,
  ReceivedEvents,
  ReceivedLocations,
  ReceivedProjects,
  SelectedLocation,
  ToggleDrawer,
  TogglePicker,
  ViewEventDetail,
  ViewToday,
}

export type CalendarView =
  | "dayGridMonth"
  | "listWeek"
  | "resourceTimeGridDay"
  | "resourceTimeGridWeek";

export interface CalendarState {
  currentEvent?: Event;
  currentProject?: Project;
  currentStart: Date;
  currentView: string;
  detailIsOpen: boolean;
  drawerIsOpen: boolean;
  error?: Error;
  events: Event[];
  loading: boolean;
  locations: Location[];
  pickerShowing: boolean;
  projectDashboardIsOpen: boolean;
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
