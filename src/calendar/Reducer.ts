import { CalendarAction, CalendarState, Action } from "./types";
import Event from "./Event";
import Location from "./Location";
import Project from "./Project";
import UserGroup from "../user/UserGroup";

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

  if (action.type === CalendarAction.CloseProjectDashboard) {
    return { ...state, projectDashboardIsOpen: false };
  }

  if (action.type === CalendarAction.CloseGroupDashboard) {
    return { ...state, groupDashboardIsOpen: false };
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
    if (state.ref?.current) {
      state.ref.current.getApi().gotoDate(currentStart);
    }
    return { ...state, currentStart, pickerShowing: !state.pickerShowing };
  }

  if (action.type === CalendarAction.OpenGroupDashboard) {
    return {
      ...state,
      // currentProject: action.payload?.currentProject,
      groupDashboardIsOpen: true,
    };
  }

  if (action.type === CalendarAction.OpenProjectDashboard) {
    return {
      ...state,
      currentProject: action.payload?.currentProject,
      projectDashboardIsOpen: true,
    };
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

  if (action.type === CalendarAction.ReceivedGroups) {
    if (!action.payload?.currentProjectGroups) {
      throw new Error("no groups in received groups");
    }
    return {
      ...state,
      loading: false, // ! need to evaluate the `loading` handling
      currentProjectGroups: action.payload.currentProjectGroups.map(
        (group: UserGroup) => new UserGroup(group)
      ),
    };
  }

  if (action.type === CalendarAction.ReceivedLocations) {
    if (!action.payload?.locations) {
      throw new Error("no locations in received locations");
    }
    if (!state.locations.length) {
      let savedLocations = sessionStorage.getItem("locations");
      if (savedLocations) {
        try {
          savedLocations = JSON.parse(savedLocations);
          // loop over payload with saved, updating selected
          if (Array.isArray(savedLocations)) {
            savedLocations.forEach((savedLocation) => {
              const location = action.payload?.locations?.find(
                (l) => l.id === savedLocation.id
              );
              if (location) location.selected = savedLocation.selected;
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    return {
      ...state,
      loading: !state.events,
      locations: action.payload.locations.map(
        (location) => new Location(location)
      ),
    };
  }

  if (action.type === CalendarAction.ReceivedProjects) {
    if (!action.payload?.projects) {
      throw new Error("no projects in received projects");
    }
    return {
      ...state,
      loading: !state.events || !state.locations,
      projects: action.payload.projects.map((project) => new Project(project)),
    };
  }

  if (action.type === CalendarAction.SelectedGroup) {
    if (!action.payload?.currentGroup) {
      throw new Error("no group in selected group");
    }
    return { ...state, currentGroup: action.payload.currentGroup };
  }

  if (action.type === CalendarAction.SelectedLocation) {
    if (!action.payload?.locations) {
      throw new Error("no locations in selected location");
    }
    sessionStorage.setItem(
      "locations",
      JSON.stringify(action.payload.locations)
    );
    return { ...state, locations: action.payload.locations };
  }

  if (action.type === CalendarAction.SelectedProject) {
    if (!action.payload?.projects) {
      throw new Error("no user projects in selected projects");
    }
    return { ...state, projects: action.payload.projects };
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
