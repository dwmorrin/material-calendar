import { CalendarUIProps } from "../calendar/types";
import Event from "../resources/Event";
import Location, { LocationDictionary } from "../resources/Location";
import Project from "../resources/Project";

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
  prevProps: CalendarUIProps,
  nextProps: CalendarUIProps
): boolean => {
  const prevState = prevProps.state;
  const nextState = nextProps.state;
  const compareDeep = (a: unknown, b: unknown): boolean =>
    JSON.stringify(a) === JSON.stringify(b);
  return (
    prevState.ref === nextState.ref &&
    prevState.currentStart === nextState.currentStart &&
    prevState.loading === nextState.loading &&
    compareDeep(prevState.resources, nextState.resources)
  );
};

export const makeResources = (
  locations: Location[],
  projectLocations: Set<number>
): Omit<Location, "id">[] =>
  locations
    .filter(
      (location) => projectLocations.has(location.id) || location.selected
    )
    .map((location) => ({
      ...location,
      id: String(location.id),
    }));

export const makeSelectedLocationIdSet = (projects: Project[]): Set<number> => {
  const set = new Set<number>();
  projects
    .filter((project) => project.selected)
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
  selectedLocations: LocationDictionary
): Omit<Event, "id">[] => {
  const result: Omit<Event, "id">[] = [];
  for (const event of events) {
    if (
      projectLocationIds.has(event.location.id) ||
      selectedLocations[event.location.title]
    )
      result.push({ ...event, id: String(event.id) });
  }
  return result;
};

export const stringStartsWithResource = (s: string): boolean =>
  s.indexOf("resource") === 0;
