import {
  Action,
  CalendarAction,
  CalendarUIProps,
  CalendarUISelectionProps,
} from "../../calendar/types";
import Event from "../../resources/Event";
import Location from "../../resources/Location";
import Project from "../../resources/Project";
import { deepEqual } from "fast-equals";
import fetchCurrentEvent from "../../calendar/fetchCurrentEvent";

export const makeEventClick =
  (dispatch: (action: Action) => void, events: Event[]) =>
  // full calendar callback for event click, string ID from full calendar
  ({ event: { id = "" } }): void => {
    const dispatchError = (error: Error): void =>
      dispatch({ type: CalendarAction.Error, payload: { error } });
    const currentEvent = events.find((event) => event.id === +id);
    if (!currentEvent) return dispatchError(new Error("Event not found"));
    dispatch({
      type: CalendarAction.OpenEventDetail,
      payload: { currentEvent },
    });
    // check for changes on the server
    fetchCurrentEvent(dispatch, currentEvent);
  };

const getBackgroundColor = (
  event: Event,
  walkInDetails = Event.walkInDetails()
): string => {
  if (event.reservation) {
    // highlight user owned reservations
    // TODO: if (current user owns reservation) ...
    // event.reservation.groupId
    // indicate someone else's reservation
    return "salmon";
  } else if (event.reservable) {
    // highlight available walk-in times
    if (Event.isAvailableForWalkIn(event, walkInDetails))
      return "mediumseagreen";
    // indicate reservable times
    return "darkseagreen";
  }
  // event is not reservable
  return "";
};

export const addResourceId =
  (walkInDetails = Event.walkInDetails()) =>
  (event: Event): Omit<Event, "id"> => ({
    ...event,
    backgroundColor: getBackgroundColor(event, walkInDetails),
    resourceId: event.location.id,
  });

/**
 * 2nd argument to React.memo
 * explicitly declare what state FullCalendar depends on for rendering
 * ignore state.currentView: change is handled via the exposed API, not state
 */
export const compareCalendarStates = (
  prevProps: CalendarUIProps & CalendarUISelectionProps,
  nextProps: CalendarUIProps & CalendarUISelectionProps
): boolean => {
  const prevState = prevProps.state;
  const nextState = nextProps.state;
  const prevSelections = prevProps.selections;
  const nextSelections = nextProps.selections;
  return (
    prevState.ref === nextState.ref &&
    prevState.currentStart === nextState.currentStart &&
    prevState.initialResourcesPending === nextState.initialResourcesPending &&
    deepEqual(prevState.resources, nextState.resources) &&
    deepEqual(prevSelections, nextSelections)
  );
};

export const makeResources = (
  locations: Location[],
  projectLocations: Set<number>,
  locationIds: number[]
): Omit<Location, "id">[] =>
  locations
    .filter(
      (location) =>
        projectLocations.has(location.id) || locationIds.includes(location.id)
    )
    .map((location) => ({
      ...location,
      id: String(location.id),
    }));

export const makeSelectedLocationIdSet = (
  projects: Project[],
  projectIds: number[]
): Set<number> => {
  const set = new Set<number>();
  projects
    .filter(({ id }) => projectIds.includes(id))
    .forEach((project) =>
      project.allotments.forEach(({ locationId }) => set.add(locationId))
    );
  return set;
};

export const getEventsByLocationId = (
  events: Event[],
  projectLocationIds: Set<number>,
  locationIds: number[]
): Omit<Event, "id">[] => {
  const result: Omit<Event, "id">[] = [];
  const walkInDetails = Event.walkInDetails();
  for (const event of events) {
    if (
      projectLocationIds.has(event.location.id) ||
      locationIds.includes(event.location.id)
    )
      result.push({
        ...event,
        backgroundColor: getBackgroundColor(event, walkInDetails),
        id: String(event.id),
      });
  }
  return result;
};
