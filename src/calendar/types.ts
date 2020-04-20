import Event from "./Event";
import Location from "./Location";
import FullCalendar from "@fullcalendar/react";
export enum CalendarAction {
  ChangedView,
  CloseEventDetail,
  Error,
  Loading,
  PickedDate,
  ReceivedEvents,
  ReceivedLocations,
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
  currentStart: Date;
  currentView: string;
  detailIsOpen: boolean;
  drawerIsOpen: boolean;
  error?: Error;
  events: Event[];
  loading: boolean;
  locations: Location[];
  pickerShowing: boolean;
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
