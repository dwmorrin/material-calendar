import {
  AdminAction,
  Action,
  AdminUIProps,
  AdminState,
  CalendarSelectionState,
  AdminSelectionProps,
} from "../types";
import VirtualWeek from "../../../resources/VirtualWeek";
import Project from "../../../resources/Project";
import Location from "../../../resources/Location";
import {
  addDays,
  areIntervalsOverlappingInclusive,
  differenceInMinutes,
  isValidSQLDateInterval,
  formatSQLDate,
  parseAndFormatFCString,
  parseFCString,
  parseSQLDate,
  parseSQLDatetime,
  subDays,
} from "../../../utils/date";
import { scaleOrdinal, schemeCategory10 } from "d3";
import Event from "../../../resources/Event";
import RosterRecord from "../../../resources/RosterRecord";
import Semester from "../../../resources/Semester";
import { deepEqual } from "fast-equals";
import { ResourceKey } from "../../../resources/types";
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

interface DailyHours {
  date: string;
  hours: number;
}
interface ProjectInfo {
  [key: number]: {
    students: number;
    groupNumberEstimate: number;
    groupHoursEstimate: number;
  };
}

//--- MODULE CONSTANTS ---

const RESOURCE_COLUMN_TEXT_CLASSNAME = "fc-datagrid-cell-main";

//--- MODULE FUNCTIONS ---

const addADay = (s: string): string => {
  return formatSQLDate(addDays(parseSQLDate(s), 1));
};

// to display numbers in 0, 1, or 2 decimal places automatically
const round = (n: number): number => Math.round(n * 100) / 100;

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

export const getProjectInfo = (
  projects: Project[],
  rosterRecords: RosterRecord[]
): ProjectInfo => {
  // counting # of students in each project to calculate # of groups
  // and hours required for each project
  return projects.reduce((acc, project) => {
    // record has course.id, course.section (title)
    // project has course.id, course.sections (array of titles)
    const count = rosterRecords.reduce(
      (sum, record) =>
        record.course.id === project.course.id &&
        project.course.sections.includes(record.course.section)
          ? sum + 1
          : sum,
      0
    );
    const groups = Math.ceil(count / project.groupSize);
    acc[project.id] = {
      students: count,
      groupNumberEstimate: groups,
      groupHoursEstimate: groups * project.groupAllottedHours,
    };
    return acc;
  }, {} as ProjectInfo);
};

// would prefer this to come from the server, but wasn't able to get react to update
// using useEffect and fetch. It was a mystery.
export const makeLocationHours = (locationEvents: Event[]): DailyHours[] => {
  const eventLocationHours = Object.entries(
    locationEvents.reduce((acc, event) => {
      const { start, end } = event;
      const hours =
        differenceInMinutes(parseSQLDatetime(end), parseSQLDatetime(start)) /
        60;
      const day = start.split(" ")[0];
      if (!(day in acc)) acc[day] = hours;
      else acc[day] += hours;
      return acc;
    }, {} as { [key: string]: number })
  ).map(([date, hours]) => ({ date, hours }));
  eventLocationHours.sort((a, b) => a.date.localeCompare(b.date));
  return eventLocationHours;
};

export const makeResources = (
  projects: Project[],
  locationId: number,
  semester: Semester,
  rosterRecords: RosterRecord[]
): ProjectResource[] => {
  const projectInfo = getProjectInfo(projects, rosterRecords);
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
      id: `${Project.allotmentPrefix}${project.id}`,
      title: `Allotments (Global total: ${project.totalAllottedHours}/${
        projectInfo[project.id].groupHoursEstimate
      })`,
      parentId: project.id,
      eventBackgroundColor: getColor("" + project.id),
      extendedProps: { projectId: project.id },
    })),
    {
      id: VirtualWeek.hoursRemainingId,
      title: "Not Allotted/Available for Booking",
      eventBackgroundColor: "grey",
    },
  ];
};

export const makeAllotmentSummaryEvent = (
  p: Project,
  locationId: number,
  total: number,
  totalReservedHours: number,
  neededHours: number
): SchedulerEventProps => ({
  id: `allotmentTotal${p.id}`,
  start: p.start,
  end: addADay(p.end),
  resourceId: String(p.id),
  allDay: true,
  title: `${p.title} |A:${total}|M:${
    p.locationHours.find(({ locationId: id }) => id === locationId)?.hours
  }|R:${round(totalReservedHours)}|N:${round(neededHours)}`,
  extendedProps: {
    projectId: p.id,
  },
});

export const makeAllotmentEventMap =
  (p: Project, reservations: Event[]) =>
  (a: Allotment, index: number): SchedulerEventProps => {
    // get hours of reservations
    const aStart = parseSQLDate(a.start);
    const aEnd = parseSQLDate(a.end);
    const hours = reservations.reduce((acc, event) => {
      const { start, end } = event;
      const startTime = parseSQLDatetime(start);
      if (
        startTime.valueOf() < aStart.valueOf() ||
        startTime.valueOf() > aEnd.valueOf()
      )
        return acc;
      const endTime = parseSQLDatetime(end);
      return acc + differenceInMinutes(endTime, startTime) / 60;
    }, 0);

    return {
      ...a,
      end: addADay(a.end),
      id: `${Project.allotmentPrefix}${p.id}-${index}`,
      resourceId: `${Project.allotmentPrefix}${p.id}`,
      allDay: true,
      title: `Res:${round(hours)}/Allot:${a.hours}`,
      extendedProps: {
        projectId: p.id,
      },
    };
  };

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
  locationId: number,
  locationEvents: Event[],
  rosterRecords: RosterRecord[]
): SchedulerEventProps[] => {
  const projectInfo = getProjectInfo(projects, rosterRecords);
  return projects.reduce((allots, p) => {
    const reservations = locationEvents.filter(
      (e) => e.reservation && e.reservation.projectId === p.id
    );
    const totalReservedHours = reservations.reduce((acc, event) => {
      const { start, end } = event;
      const startTime = parseSQLDatetime(start);
      const endTime = parseSQLDatetime(end);
      return acc + differenceInMinutes(endTime, startTime) / 60;
    }, 0);
    const ofInterest = p.allotments?.filter((a) => a.locationId === locationId);
    if (!ofInterest?.length)
      return [
        ...allots,
        makeAllotmentSummaryEvent(
          p,
          locationId,
          0,
          totalReservedHours,
          projectInfo[p.id].groupHoursEstimate
        ),
      ];
    const [, , total] = ofInterest.reduce(getFirstLastAndTotalFromAllotments, [
      {},
      {},
      0,
    ] as [Allotment, Allotment, number]);
    allots.push(
      makeAllotmentSummaryEvent(
        p,
        locationId,
        total,
        totalReservedHours,
        projectInfo[p.id].groupHoursEstimate
      )
    );
    allots.push(...ofInterest.map(makeAllotmentEventMap(p, reservations)));
    return allots;
  }, [] as SchedulerEventProps[]);
};

/**
 * sums the event hours
 */
export const makeDailyHours = (
  dailyHours: { date: string; hours: number }[], // must be sorted ascending
  numberOfDays: number,
  { start }: Semester
): [SchedulerEventProps[], DailyHours[]] => {
  let currentDate = start;
  let nextHours = dailyHours.shift();
  const hoursAsEvents: SchedulerEventProps[] = [];
  const dailyHoursFilledIn: DailyHours[] = [];
  while (hoursAsEvents.length < numberOfDays) {
    if (nextHours && nextHours.date === currentDate) {
      dailyHoursFilledIn.push({ ...nextHours });
      hoursAsEvents.push({
        id: `${Location.locationHoursId}-${hoursAsEvents.length}`,
        start: nextHours.date,
        allDay: true,
        title: "" + round(nextHours.hours),
        resourceId: Location.locationHoursId,
      });
      nextHours = dailyHours.shift();
    } else {
      dailyHoursFilledIn.push({ date: currentDate, hours: 0 });
      hoursAsEvents.push({
        id: `${Location.locationHoursId}-${hoursAsEvents.length}`,
        start: currentDate,
        allDay: true,
        title: String(0),
        resourceId: Location.locationHoursId,
      });
    }
    currentDate = addADay(currentDate);
  }
  return [hoursAsEvents, dailyHoursFilledIn];
};

// need to calculate total hours for each week from the DailyHours
export const processVirtualWeeks = (
  virtualWeeks: VirtualWeek[],
  locationId: number,
  hoursForCalc: DailyHours[]
): [SchedulerEventProps[], (VirtualWeek & { totalHours: number })[]] => {
  const res = [] as (VirtualWeek & { totalHours: number })[];
  const vwEvents = virtualWeeks
    .filter((vw) => vw.locationId === locationId)
    .map((vw) => {
      // calculate total hours for each week
      const start = hoursForCalc.findIndex(({ date }) => date === vw.start);
      const end = hoursForCalc.findIndex(({ date }) => date === vw.end);
      let totalHours = 0;
      if (start >= 0)
        for (let i = start; i <= end; i++) totalHours += hoursForCalc[i].hours;
      res.push({ ...vw, totalHours });
      return {
        ...vw,
        end: addADay(vw.end),
        id: `${VirtualWeek.eventPrefix}${vw.id}`,
        resourceId: VirtualWeek.resourceId,
        allDay: true,
        title: String(round(totalHours)),
      };
    });
  return [vwEvents, res];
};

export const processVirtualWeeksAsHoursRemaining = (
  virtualWeeks: (VirtualWeek & { totalHours: number })[],
  locationId: number,
  locationEvents: Event[]
): SchedulerEventProps[] => {
  const now = new Date();
  return virtualWeeks
    .filter((vw) => vw.locationId === locationId)
    .map((vw) => {
      // get available reservation hours
      const vwStartDate = parseSQLDate(vw.start);
      const vwEndDate = parseSQLDate(vw.end);
      // skip if the virtual week is in the past
      //! BUG: not comparing correctly
      //! cannot compare dates with datetimes directly
      //! convert datetime to date before comparing
      const available =
        vwEndDate.valueOf() < now.valueOf()
          ? 0
          : locationEvents.reduce(
              (total, { start, end, reservation, reservable }) => {
                // skip if not reservable or already reserved
                if (!reservable || reservation) return total;
                const startDate = parseSQLDatetime(start);
                // skip if event is in the past
                if (startDate.valueOf() < now.valueOf()) return total;
                // skip if event is outside of the virtual week
                if (
                  startDate.valueOf() < vwStartDate.valueOf() ||
                  startDate.valueOf() > vwEndDate.valueOf()
                )
                  return total;
                return (
                  total +
                  differenceInMinutes(
                    parseSQLDatetime(end),
                    parseSQLDatetime(start)
                  ) /
                    60
                );
              },
              0
            );
      return {
        start: vw.start,
        end: addADay(vw.end),
        id: `hr${vw.id}`,
        resourceId: VirtualWeek.hoursRemainingId,
        allDay: true,
        title: `${round(vw.totalHours - vw.projectHours)}/${available}`,
      };
    });
};

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
          const maybeProjectId = id.startsWith(Project.allotmentPrefix)
            ? Number(id.replace(Project.allotmentPrefix, ""))
            : Number(id);
          if (!isNaN(maybeProjectId) && maybeProjectId > 0)
            // warning: we're assuming this project exists; throws if not
            return dispatch({
              type: AdminAction.OpenDetailWithProjectById,
              meta: maybeProjectId,
            });
          // else we don't know what to do with this resource
          console.log("unhandled resource click, ID: " + id);
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
            title,
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
