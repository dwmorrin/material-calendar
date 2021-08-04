import {
  AdminAction,
  Action,
  AdminUIProps,
  AdminState,
  CalendarSelectionState,
  AdminSelectionProps,
} from "./types";
import VirtualWeek from "../resources/VirtualWeek";
import Project from "../resources/Project";
import Location from "../resources/Location";
import {
  addDays,
  areIntervalsOverlappingInclusive,
  compareAscSQLDate,
  isValidSQLDateInterval,
  formatSQLDate,
  getDayFromNumber,
  getDayNumberFromSQLDate,
  parseAndFormatFCString,
  parseFCString,
  parseSQLDate,
  subDays,
} from "../utils/date";
import { scaleOrdinal, schemeCategory10 } from "d3";
import Semester from "../resources/Semester";
import { deepEqual } from "fast-equals";
import { ResourceKey } from "../resources/types";
import { createVirtualWeek } from "./virtualWeeksDialog";

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
    extendedProps: Record<string, unknown>;
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
    extendedProps?: Record<string, unknown>;
  };
}

type SchedulerEventProps = {
  id: string;
  start: string;
  end?: string;
  resourceId: string;
  allDay: boolean;
  title: string;
  extendedProps?: Record<string, unknown>;
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
  {
    state: {
      ref: prevRef,
      resources: prevResources,
      selectedSemester: prevSemester,
    },
    selections: prevSelections,
  }: AdminUIProps & AdminSelectionProps,
  {
    state: {
      ref: nextRef,
      resources: nextResources,
      selectedSemester: nextSemester,
    },
    selections: nextSelections,
  }: AdminUIProps & AdminSelectionProps
): boolean => {
  return (
    prevRef === nextRef &&
    prevSelections.locationId === nextSelections.locationId &&
    prevSemester === nextSemester &&
    deepEqual(prevResources, nextResources)
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
  const overlapsSemester = areIntervalsOverlappingInclusive({
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
      extendedProps: { projectId: project.id },
    })),
    ...projectsOfInterest.map((project) => ({
      id: `Allotments${project.id}`,
      title: "Allotments",
      parentId: project.id,
      eventBackgroundColor: getColor("" + project.id),
      extendedProps: { projectId: project.id },
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
  extendedProps: {
    projectId: p.id,
  },
});

export const makeAllotmentEventMap =
  (p: Project) =>
  (a: Allotment, index: number): SchedulerEventProps => ({
    ...a,
    end: addADay(a.end),
    id: `${Project.allotmentPrefix}${p.id}-${index}`,
    resourceId: `Allotments${p.id}`,
    allDay: true,
    title: "" + a.hours,
    extendedProps: {
      projectId: p.id,
    },
  });

export const getFirstLastAndTotalFromAllotments = (
  [first, last, total]: [Allotment, Allotment, number],
  allot: Allotment
): [Allotment, Allotment, number] => {
  if (!first.start || !last.start) return [allot, allot, allot.hours];
  return [
    isValidSQLDateInterval({ start: allot.start, end: first.start })
      ? allot
      : first,
    isValidSQLDateInterval({ start: last.start, end: allot.start })
      ? allot
      : last,
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

/**
 * Creates a row of events displaying the numbers of hours available for each date
 * in the semester.
 * Uses either hours returned from the database, or the locations default hours.
 */
export const makeDailyHours = (
  location: Location,
  numberOfDays: number,
  { start }: Semester
): SchedulerEventProps[] => {
  const hours = location.hours.slice();
  hours.sort(({ date: start }, { date: end }) =>
    compareAscSQLDate({ start, end })
  );
  let currentDate = start;
  let nextHours = hours.shift();
  let dayPointer = getDayNumberFromSQLDate(currentDate);
  const res = [] as SchedulerEventProps[];
  while (res.length < numberOfDays) {
    if (nextHours && nextHours.date === currentDate) {
      res.push({
        id: `${Location.locationHoursId}-${res.length}`,
        start: nextHours.date,
        allDay: true,
        title: "" + nextHours.hours,
        resourceId: Location.locationHoursId,
      });
      nextHours = hours.shift();
    } else {
      const day = getDayFromNumber(dayPointer);
      res.push({
        id: `${Location.locationHoursId}-${res.length}`,
        start: currentDate,
        allDay: true,
        title: String(location.defaultHours[day]),
        resourceId: Location.locationHoursId,
      });
    }
    currentDate = addADay(currentDate);
    dayPointer = (dayPointer + 1) % 7;
  }
  return res;
};

export const processVirtualWeeks = (
  virtualWeeks: VirtualWeek[],
  locationId: number
): SchedulerEventProps[] => {
  return virtualWeeks
    .filter((vw) => vw.locationId === locationId)
    .map((vw) => ({
      ...vw,
      end: addADay(vw.end),
      id: `${VirtualWeek.eventPrefix}${vw.id}`,
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

export const resourceClick =
  ({
    id,
    dispatch,
    location,
    semester,
  }: {
    id: string;
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
        case VirtualWeek.resourceId:
          return console.log("TODO: virtual week dialog");
        case VirtualWeek.hoursRemainingId:
          return console.log("TODO: hours remaining dialog");
        case Location.locationHoursId: {
          return dispatch({
            type: AdminAction.OpenLocationHoursDialog,
            payload: {
              calendarSelectionState: {
                start: semester.start,
                end: semester.end,
                location,
                resource: { extendedProps: {} },
              },
            },
          });
        }
        default: {
          return dispatch({
            type: AdminAction.OpenDetailWithProjectById,
            meta: Number(id),
          });
        }
      }
    }
  };

export const eventClick =
  (dispatch: (action: Action) => void, location: Location) =>
  ({
    event: { id, title, startStr, endStr, extendedProps },
  }: EventProps): void => {
    if (!startStr)
      return dispatch({
        type: AdminAction.Error,
        payload: {
          error: new Error(`Event with id ${id} is missing start info`),
        },
      });
    if (id.startsWith(VirtualWeek.eventPrefix)) {
      return dispatch({
        type: AdminAction.OpenVirtualWeekModifyDialog,
        payload: {
          calendarEventClickState: {
            title,
            startStr,
            endStr,
            extendedProps: {
              id: Number(id.replace(VirtualWeek.eventPrefix, "")),
            },
          },
        },
      });
    } else if (id.startsWith(Location.locationHoursId)) {
      return dispatch({
        type: AdminAction.OpenLocationHoursDialog,
        payload: {
          calendarSelectionState: {
            start: startStr,
            end: endStr,
            location,
            resource: { extendedProps: {} },
          },
        },
      });
    } else if (id.startsWith("allotmentTotal")) {
      return dispatch({
        type: AdminAction.OpenProjectLocationHoursSummaryDialog,
        payload: {
          calendarEventClickState: {
            title,
            startStr,
            endStr,
            extendedProps,
          },
        },
      });
    } else if (id.startsWith(Project.allotmentPrefix)) {
      return dispatch({
        type: AdminAction.OpenProjectLocationHoursDialog,
        payload: {
          calendarSelectionState: {
            start: startStr,
            end: endStr,
            location,
            resource: { extendedProps },
          },
        },
      });
    }
    console.group("Unhandled scheduler event click");
    console.log({ id, title, startStr, extendedProps });
    console.groupEnd();
  };

export const selectionHandler =
  (
    dispatch: (action: Action) => void,
    state: AdminState,
    location: Location,
    semester: Semester
  ) =>
  ({ startStr, endStr, resource }: SelectProps): void => {
    const calendarSelectionState: CalendarSelectionState = {
      start: startStr,
      end: endStr,
      location,
      resource: { extendedProps: resource?.extendedProps || {} },
    };
    const payload = { calendarSelectionState };

    switch (resource?.id) {
      case Location.locationHoursId:
        return dispatch({
          type: AdminAction.OpenLocationHoursDialog,
          payload,
        });
      case VirtualWeek.resourceId: {
        // check for existing week inside selection
        const start = parseSQLDate(startStr);
        const end = subDays(parseSQLDate(endStr), 1);
        const overlaps = areIntervalsOverlappingInclusive({ start, end });
        const virtualWeeks = (
          state.resources[ResourceKey.VirtualWeeks] as VirtualWeek[]
        ).filter(
          (vw) =>
            vw.locationId === location.id &&
            overlaps({
              start: parseSQLDate(vw.start),
              end: parseSQLDate(vw.end),
            })
        );
        if (virtualWeeks && virtualWeeks[0]) {
          return dispatch({
            type: AdminAction.OpenVirtualWeekModifyDialog,
            payload: {
              calendarEventClickState: {
                title: "",
                startStr,
                endStr,
                extendedProps: { id: virtualWeeks[0].id },
              },
            },
          });
        }
        return createVirtualWeek({
          dispatch,
          state,
          locationId: location.id,
          start: parseAndFormatFCString(startStr),
          end: formatSQLDate(subDays(parseFCString(endStr), 1)),
          semester,
        });
      }
      default: {
        // selecting on allotment summary row or allotment row
        const projectId = resource?.extendedProps?.projectId;
        if (typeof projectId === "number" && projectId > 0)
          return dispatch({
            type: AdminAction.OpenProjectLocationHoursDialog,
            payload,
          });
        console.group("Unhandled Scheduler selection");
        console.log({ startStr, endStr, resource });
        console.groupEnd();
      }
    }
  };
