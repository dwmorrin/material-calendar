import { AdminAction, Action, AdminUIProps } from "./types";
import VirtualWeek from "../resources/VirtualWeek";
import Project from "../resources/Project";
import Location from "../resources/Location";
import { compareDateOrder, formatSQLDate, parseSQLDate } from "../utils/date";
import { scaleOrdinal, schemeCategory10 } from "d3";
import Semester from "../resources/Semester";
import { addDays } from "date-fns";
import { areIntervalsOverlappingWithOptions } from "date-fns/fp";
import { deepEqual } from "fast-equals";

//--- TYPES ---

type Allotment = {
  start: string;
  end: string;
  hours: number;
};

interface EventProps {
  event: {
    id: string;
    title: string;
    startStr: string;
    endStr: string;
    extendedProps: { [k: string]: unknown };
  };
}

type ProjectResource = {
  eventBackgroundColor?: string;
  id: string;
  title: string;
  parentId?: string;
};

interface SelectProps {
  startStr: string;
  endStr: string;
  resource?: {
    id: string;
    title?: string;
    extendedProps?: { [k: string]: unknown };
  };
}

type SchedulerEventProps = {
  id: string;
  start: string;
  end?: string;
  resourceId: string;
  allDay: boolean;
  title: string;
  extendedProps?: { [k: string]: unknown };
};

//--- MODULE CONSTANTS ---

const RESOURCE_COLUMN_TEXT_CLASSNAME = "fc-datagrid-cell-main";
const MILLISECONDS_PER_DAY = 8.64e7;

//--- MODULE FUNCTIONS ---

const addADay = (s: string): string => {
  return formatSQLDate(addDays(parseSQLDate(s), 1));
};

//--- EXPORTED FUNCTIONS ---

/**
 * 2nd argument to React.memo
 * explicitly declare what state FullCalendar depends on for rendering
 */
export const compareCalendarStates = (
  prevProps: AdminUIProps,
  nextProps: AdminUIProps
): boolean => {
  const prevState = prevProps.state;
  const nextState = nextProps.state;
  return (
    prevState.ref === nextState.ref &&
    prevState.schedulerLocationId === nextState.schedulerLocationId &&
    prevState.selectedSemester === nextState.selectedSemester &&
    deepEqual(prevState.resources, nextState.resources)
  );
};

export const fetchDefaultLocation = (
  dispatch: (action: Action) => void,
  setDefaultLocationId: (id: number) => void
): void => {
  fetch(`${Location.url}/default`)
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error)
        return dispatch({ type: AdminAction.Error, payload: { error } });
      if (data.length) {
        const id = data[0].id;
        setDefaultLocationId(id);
        dispatch({
          type: AdminAction.SelectedSchedulerLocation,
          payload: { schedulerLocationId: id },
        });
      }
    })
    .catch((error) =>
      dispatch({
        type: AdminAction.Error,
        payload: { error },
        meta: "DEFAULT_LOCATION_FETCH",
      })
    );
};

export const millisecondsToDays = (ms: number): number =>
  ms < 0
    ? Math.ceil(ms / MILLISECONDS_PER_DAY)
    : Math.floor(ms / MILLISECONDS_PER_DAY);

export const daysInInterval = (start: string, end: string): number => {
  const inclusive = millisecondsToDays(
    new Date(end).valueOf() - new Date(start).valueOf()
  );
  return inclusive + 1 * (inclusive < 0 ? -1 : 1);
};

export const makeResources = (
  projects: Project[],
  locationId: number,
  semester: Semester
): ProjectResource[] => {
  const overlapsSemester = areIntervalsOverlappingWithOptions({
    inclusive: true,
  })({
    start: parseSQLDate(semester.start),
    end: parseSQLDate(semester.end),
  });
  const getColor = scaleOrdinal(schemeCategory10);
  const projectsOfInterest = projects.filter(
    (project) =>
      overlapsSemester({
        start: parseSQLDate(project.start),
        end: parseSQLDate(project.end),
      }) &&
      project.locationHours.some(({ locationId: id }) => id === locationId)
  );
  return [
    {
      id: VirtualWeek.resourceId,
      title: "Virtual Weeks",
    },
    {
      id: Location.locationHoursId,
      title: "Daily Location Hours",
    },
    ...projectsOfInterest.map((project) => ({
      id: "" + project.id,
      title: project.title,
      eventBackgroundColor: getColor("" + project.id),
    })),
    ...projectsOfInterest.map((project) => ({
      id: `Allotments${project.id}`,
      title: "Allotments",
      parentId: project.id,
      eventBackgroundColor: getColor("" + project.id),
    })),
    {
      id: VirtualWeek.hoursRemainingId,
      title: "Hours Remaining",
      eventBackgroundColor: "grey",
    },
  ];
};

export const makeAllotmentSummaryEvent = (
  p: Project,
  locationId: number,
  total: number
): SchedulerEventProps => ({
  id: `allotmentTotal${p.id}`,
  start: p.start,
  end: addADay(p.end),
  resourceId: String(p.id),
  allDay: true,
  title: `${p.title} - Allotted: ${total} - Max: ${
    p.locationHours.find(({ locationId: id }) => id === locationId)?.hours
  }`,
});

export const makeAllotmentEventMap =
  (p: Project) =>
  (a: Allotment, index: number): SchedulerEventProps => ({
    ...a,
    end: addADay(a.end),
    id: `allotment${p.id}-${index}`,
    resourceId: `Allotments${p.id}`,
    allDay: true,
    title: "" + a.hours,
  });

export const getFirstLastAndTotalFromAllotments = (
  [first, last, total]: [Allotment, Allotment, number],
  allot: Allotment
): [Allotment, Allotment, number] => {
  if (!first.start || !last.start) return [allot, allot, allot.hours];
  return [
    compareDateOrder(allot.start, first.start) ? allot : first,
    compareDateOrder(last.start, allot.start) ? allot : last,
    total + allot.hours,
  ];
};

export const makeAllotments = (
  projects: Project[],
  locationId: number
): SchedulerEventProps[] =>
  projects.reduce((allots, p) => {
    const ofInterest = p.allotments?.filter((a) => a.locationId === locationId);
    if (!ofInterest?.length)
      return [...allots, makeAllotmentSummaryEvent(p, locationId, 0)];
    const [, , total] = ofInterest.reduce(getFirstLastAndTotalFromAllotments, [
      {},
      {},
      0,
    ] as [Allotment, Allotment, number]);
    allots.push(makeAllotmentSummaryEvent(p, locationId, total));
    allots.push(...ofInterest.map(makeAllotmentEventMap(p)));
    return allots;
  }, [] as SchedulerEventProps[]);

export const makeDailyHours = (location: Location): SchedulerEventProps[] =>
  location.hours.map((dailyHours, index) => ({
    id: `${Location.locationHoursId}-${index}`,
    start: dailyHours.date,
    allDay: true,
    title: "" + dailyHours.hours,
    resourceId: Location.locationHoursId,
    extendedProps: { start: dailyHours.start, end: dailyHours.end },
  }));

export const processVirtualWeeks = (
  virtualWeeks: VirtualWeek[],
  locationId: number
): SchedulerEventProps[] => {
  return virtualWeeks
    .filter((vw) => vw.locationId === locationId)
    .map((vw) => ({
      ...vw,
      end: addADay(vw.end),
      id: `vw${vw.id}`,
      resourceId: VirtualWeek.resourceId,
      allDay: true,
      title: `${vw.locationHours}`,
    }));
};

export const processVirtualWeeksAsHoursRemaining = (
  virtualWeeks: VirtualWeek[],
  locationId: number
): SchedulerEventProps[] =>
  virtualWeeks
    .filter((vw) => vw.locationId === locationId)
    .map((vw) => ({
      ...vw,
      end: addADay(vw.end),
      id: `hr${vw.id}`,
      resourceId: VirtualWeek.hoursRemainingId,
      allDay: true,
      title: `${vw.locationHours - vw.projectHours}`,
    }));

export const mostRecent = (a: Semester, b: Semester): Semester =>
  new Date(b.start).valueOf() - new Date(a.start).valueOf() < 0 ? a : b;

//--- EVENT HANDLERS ---

export const resourceClickHandler =
  ({
    id,
    title,
    dispatch,
    location,
    semester,
  }: {
    id: string;
    title: string;
    dispatch: (a: Action) => void;
    location: Location;
    semester: Semester;
  }): ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null =>
  (event): void => {
    if (
      (event.target as HTMLElement).classList.contains(
        RESOURCE_COLUMN_TEXT_CLASSNAME
      )
    ) {
      switch (id) {
        case Location.locationHoursId: {
          return dispatch({
            type: AdminAction.OpenLocationHoursDialog,
            payload: {
              calendarSelectionState: {
                start: semester.start,
                end: semester.end,
                location,
              },
            },
          });
        }
        default:
          console.log(`no handler for ID: ${id}, TITLE: ${title}`);
      }
    }
  };

export const eventClick =
  (dispatch: (action: Action) => void, location: Location) =>
  ({ event: { id, title, startStr, endStr } }: EventProps): void => {
    if (!startStr)
      return dispatch({
        type: AdminAction.Error,
        payload: {
          error: new Error(`Event with id ${id} is missing start info`),
        },
      });
    if (id.startsWith(Location.locationHoursId)) {
      return dispatch({
        type: AdminAction.OpenLocationHoursDialog,
        payload: {
          calendarSelectionState: {
            start: startStr,
            end: endStr,
            location,
          },
        },
      });
    }
    console.group("Unhandled scheduler event click");
    console.log({ id, title, startStr });
    console.groupEnd();
  };

export const selectionHandler =
  (dispatch: (action: Action) => void, location: Location) =>
  ({ startStr, endStr, resource = { id: "" } }: SelectProps): void => {
    const calendarSelectionState = {
      start: startStr,
      end: endStr,
      location,
    };

    switch (resource.id) {
      case Location.locationHoursId:
        return dispatch({
          type: AdminAction.OpenLocationHoursDialog,
          payload: {
            calendarSelectionState,
          },
        });
      case VirtualWeek.resourceId:
        return dispatch({
          type: AdminAction.OpenVirtualWeeksDialog,
          payload: {
            calendarSelectionState,
          },
        });
      default:
        console.group("Unhandled Scheduler selection");
        console.log({ startStr, endStr, resource });
        console.groupEnd();
    }
  };
