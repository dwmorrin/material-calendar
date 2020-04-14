import { CalendarAction, CalendarState, Action } from "./types";
import Event from "./Event";
import Location from "./Location";

const calendarReducer = (
  state: CalendarState,
  action: Action
): CalendarState => {
  if (action.type === CalendarAction.Loading) {
    return { ...state, loading: true };
  }
  if (action.type === CalendarAction.ChangedView) {
    if (!action.payload?.currentView) {
      throw new Error("no view received in view change request");
    }
    if (state.ref?.current) {
      state.ref.current.getApi().changeView(action.payload.currentView);
    }
    return { ...state, currentView: action.payload.currentView };
  }
  if (action.type === CalendarAction.ViewToday) {
    if (state.ref?.current) {
      state.ref.current.getApi().today();
    }
    return { ...state, currentStart: new Date() };
  }

  if (action.type === CalendarAction.ReceivedEvents) {
    if (!action.payload || !action.payload.events) {
      throw new Error("no events in received events");
    }
    return {
      ...state,
      loading: !state.locations,
      events: action.payload.events.map(
        (event) =>
          new Event(
            event.id,
            event.start,
            event.end,
            event.location,
            event.title
          )
      ),
    };
  }

  if (action.type === CalendarAction.ReceivedLocations) {
    if (!action.payload || !action.payload.locations) {
      throw new Error("no locations in received locations");
    }
    return {
      ...state,
      loading: !state.events,
      locations: action.payload.locations.map(
        (location) => new Location(location.name, location.name)
      ),
    };
  }

  if (action.type === CalendarAction.ToggleDrawer) {
    return { ...state, drawerIsOpen: !state.drawerIsOpen };
  }

  if (action.type === CalendarAction.TogglePicker) {
    return { ...state, pickerShowing: !state.pickerShowing };
  }

  if (action.type === CalendarAction.PickedDate) {
    if (!action.payload?.currentStart) {
      throw new Error("no date returned from picker");
    }
    const currentStart = action.payload.currentStart;
    return { ...state, currentStart, pickerShowing: !state.pickerShowing };
  }

  if (action.type === CalendarAction.Error) {
    if (action.payload && action.payload.error) {
      console.error(action.payload.error);
    }
  }

  return state;
};

export default calendarReducer;
