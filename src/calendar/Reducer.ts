import { CalendarAction, CalendarState, Action } from "./types";
import Event from "./Event";
import Location from "./Location";

/**
 * calendarReducer takes all actions from the calendar and handles them
 * NOTE: the series of `if` statements should be kept in sorted order by
 *   CalendarAction, i.e. first is CalendarAction.A, last is CalendarAction.Z
 * @param {CalendarState} state The state of the calendar
 * @param {Action} action An action that needs to be handled here
 */
const calendarReducer = (
  state: CalendarState,
  action: Action
): CalendarState => {
  if (action.type === CalendarAction.ChangedView) {
    if (!action.payload?.currentView) {
      throw new Error("no view received in view change request");
    }
    if (state.ref?.current) {
      state.ref.current.getApi().changeView(action.payload.currentView);
    }
    return { ...state, currentView: action.payload.currentView };
  }

  if (action.type === CalendarAction.CloseEventDetail) {
    return { ...state, detailIsOpen: false };
  }

  if (action.type === CalendarAction.Error) {
    if (action.payload && action.payload.error) {
      console.error(action.payload.error);
    }
  }

  if (action.type === CalendarAction.Loading) {
    return { ...state, loading: true };
  }

  if (action.type === CalendarAction.PickedDate) {
    if (!action.payload?.currentStart) {
      throw new Error("no date returned from picker");
    }
    const currentStart = action.payload.currentStart;
    return { ...state, currentStart, pickerShowing: !state.pickerShowing };
  }

  if (action.type === CalendarAction.ReceivedEvents) {
    if (!action.payload?.events) {
      throw new Error("no event data in received events");
    }
    return {
      ...state,
      loading: !state.locations,
      events: action.payload.events.map((event) => new Event(event)),
    };
  }

  if (action.type === CalendarAction.ReceivedLocations) {
    if (!action.payload?.locations) {
      throw new Error("no locations in received locations");
    }
    return {
      ...state,
      loading: !state.events,
      locations: action.payload.locations.map(
        (location) => new Location(location)
      ),
    };
  }

  if (action.type === CalendarAction.SelectedLocation) {
    if (!action.payload?.locations) {
      throw new Error("no locations in selected location");
    }
    return { ...state, locations: action.payload.locations };
  }

  if (action.type === CalendarAction.ToggleDrawer) {
    return { ...state, drawerIsOpen: !state.drawerIsOpen };
  }

  if (action.type === CalendarAction.TogglePicker) {
    return { ...state, pickerShowing: !state.pickerShowing };
  }

  if (action.type === CalendarAction.ViewEventDetail) {
    if (!action.payload?.currentEvent) {
      throw new Error("no event received for detail view");
    }
    return {
      ...state,
      detailIsOpen: true,
      currentEvent: action.payload.currentEvent,
    };
  }

  if (action.type === CalendarAction.ViewToday) {
    if (state.ref?.current) {
      state.ref.current.getApi().today();
    }
    return { ...state, currentStart: new Date() };
  }

  return state;
};

export default calendarReducer;
