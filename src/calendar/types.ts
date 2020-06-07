import Event from "../resources/Event";
import Location from "../resources/Location";
import Project from "../resources/Project";
import FullCalendar from "@fullcalendar/react";
import UserGroup from "../resources/UserGroup";

export enum CalendarAction {
  ChangedView,
  CloseEventDetail,
  CloseProjectDashboard,
  CloseGroupDashboard,
  Error,
  Loading,
  PickedDate,
  OpenGroupDashboard,
  OpenProjectDashboard,
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
  ViewToday,
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
  groups: UserGroup[];
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
