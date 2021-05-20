import { AdminAction, Action, AdminUIProps } from "./types";
import VirtualWeek from "../resources/VirtualWeek";
import Project from "../resources/Project";
import Location from "../resources/Location";
import { compareDateOrder } from "../utils/date";
import { scaleOrdinal, schemeCategory10 } from "d3";
import Semester from "../resources/Semester";
import { parseJSON } from "date-fns";
import { areIntervalsOverlapping } from "date-fns/fp";

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
    start: Date | null;
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
  start: Date;
  end: Date;
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
  const d = new Date(s);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toJSON().split("T")[0];
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
  const compareDeep = (a: unknown, b: unknown): boolean =>
    JSON.stringify(a) === JSON.stringify(b);
  return (
    prevState.ref === nextState.ref &&
    prevState.schedulerLocationId === nextState.schedulerLocationId &&
    prevState.selectedSemester === nextState.selectedSemester &&
    compareDeep(prevState.resources, nextState.resources)
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

export const fetchVirtualWeeks = (
  dispatch: (action: Action) => void,
  setVirtualWeeks: (vws: VirtualWeek[]) => void,
  locationId?: number
): void => {
  if (locationId === undefined || locationId < 1) return;
  fetch(`${Location.url}/${locationId}/virtualweeks`)
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error)
        return dispatch({ type: AdminAction.Error, payload: { error } });
      setVirtualWeeks(data.map((vw: VirtualWeek) => new VirtualWeek(vw)));
    })
    .catch((error) =>
      dispatch({
        type: AdminAction.Error,
        payload: { error },
        meta: "VIRTUAL_WEEKS_FETCH",
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
  const overlapsSemester = areIntervalsOverlapping({
    start: parseJSON(semester.start),
    end: parseJSON(semester.end),
  });
  const getColor = scaleOrdinal(schemeCategory10);
  const projectsOfInterest = projects.filter(
    (project) =>
      overlapsSemester({
        start: parseJSON(project.start),
        end: parseJSON(project.end),
      }) &&
      project.allotments.some(
        (allotment) => allotment.locationId === locationId
      )
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
  first: Allotment,
  last: Allotment,
  total: number
): SchedulerEventProps => ({
  id: `allotmentTotal${p.id}`,
  start: first.start,
  end: addADay(last.end),
  resourceId: String(p.id),
  allDay: true,
  title: `${p.title.replace("Project", "")} - Total Hours: ${total}`,
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
    const ofInterest = p.allotments.filter((a) => a.locationId === locationId);
    if (!ofInterest.length) return allots;
    const [first, last, total] = ofInterest.reduce(
      getFirstLastAndTotalFromAllotments,
      [{}, {}, 0] as [Allotment, Allotment, number]
    );
    allots.push(makeAllotmentSummaryEvent(p, first, last, total));
    allots.push(...ofInterest.map(makeAllotmentEventMap(p)));
    return allots;
  }, [] as SchedulerEventProps[]);

export const makeDailyHours = (location: Location): SchedulerEventProps[] =>
  location.hours.map((dailyHours) => ({
    id: `${Location.locationHoursId}-${dailyHours.id}`,
    start: dailyHours.date,
    allDay: true,
    title: "" + dailyHours.hours,
    resourceId: Location.locationHoursId,
    extendedProps: { start: dailyHours.start, end: dailyHours.end },
  }));

export const processVirtualWeeks = (
  virtualWeeks: VirtualWeek[],
  locationId: number
): SchedulerEventProps[] =>
  virtualWeeks
    .filter((vw) => vw.locationId === locationId)
    .map((vw) => ({
      ...vw,
      end: addADay(vw.end),
      id: `vw${vw.id}`,
      resourceId: VirtualWeek.resourceId,
      allDay: true,
      title: `${vw.locationHours}`,
    }));

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
  (
    id: string,
    title: string
  ): ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null =>
  (event): void => {
    if (
      (event.target as HTMLElement).classList.contains(
        RESOURCE_COLUMN_TEXT_CLASSNAME
      )
    ) {
      window.alert(`ID: ${id}, TITLE: ${title}`);
    }
  };

export const eventClick =
  (dispatch: (action: Action) => void, location: Location) =>
  ({ event: { id, title, start, extendedProps } }: EventProps): void => {
    if (!start)
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
          locationHoursState: {
            select: {
              start,
              end: ((): Date => {
                const end = new Date(start.getTime());
                end.setDate(start.getDate() + 1);
                return end;
              })(),
            },
            time: {
              start: (extendedProps.start as string) || "09:00:00",
              end: (extendedProps.end as string) || "17:00:00",
            },
            location,
          },
        },
      });
    }
    console.group("Unhandled scheduler event click");
    console.log({ id, title, start, extendedProps });
    console.groupEnd();
  };

export const selectionHandler =
  (dispatch: (action: Action) => void, location: Location) =>
  ({ start, end, resource = { id: "" } }: SelectProps): void => {
    switch (resource.id) {
      case Location.locationHoursId:
        return dispatch({
          type: AdminAction.OpenLocationHoursDialog,
          payload: {
            locationHoursState: {
              select: { start, end },
              location,
              time: {
                start: (resource.extendedProps?.start as string) || "09:00:00",
                end: (resource.extendedProps?.end as string) || "17:00:00",
              },
            },
          },
        });
      default:
        console.group("Unhandled Scheduler selection");
        console.log({ start, end, resource });
        console.groupEnd();
    }
  };
