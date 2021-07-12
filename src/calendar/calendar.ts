import { CalendarUIProps, CalendarUISelectionProps } from "../calendar/types";
import Event from "../resources/Event";
import Location from "../resources/Location";
import Project from "../resources/Project";
import { deepEqual } from "fast-equals";

export const addResourceId = (event: Event): Omit<Event, "id"> => ({
  ...event,
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

/**
 * "reducing by hand" because TS would not infer type of events.reduce() as an Array
 */
export const getEventsByLocationId = (
  events: Event[],
  projectLocationIds: Set<number>,
  locationIds: number[]
): Omit<Event, "id">[] => {
  const result: Omit<Event, "id">[] = [];
  for (const event of events) {
    if (
      projectLocationIds.has(event.location.id) ||
      locationIds.includes(event.location.id)
    )
      result.push({ ...event, id: String(event.id) });
  }
  return result;
};
