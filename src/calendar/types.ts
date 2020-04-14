import Event from "./Event";
import Location from "./Location";
import FullCalendar from "@fullcalendar/react";
export enum CalendarAction {
  Error,
  Loading,
  PickedDate,
  ReceivedEvents,
  ReceivedLocations,
  ToggleDrawer,
  TogglePicker,
  ViewToday,
}

export interface CalendarState {
  currentStart: Date;
  drawerIsOpen: boolean;
  events: Event[];
  loading: boolean;
  locations: Location[];
  pickerShowing: boolean;
  ref: React.RefObject<FullCalendar> | null;
}

// https://github.com/redux-utilities/flux-standard-action
export interface Action {
  type: CalendarAction;
  payload?: {
    error?: Error;
    currentStart?: Date;
    drawerIsOpen?: boolean;
    events?: Event[];
    locations?: Location[];
    pickerShowing?: boolean;
    ref?: React.RefObject<FullCalendar> | null;
  };
  error?: boolean;
}
